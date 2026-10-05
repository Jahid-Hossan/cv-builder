// Restore the original native artifact after a runtime-image build skipped its toolchain.
// Runs on the VPS against isolated containers. No live volume or environment is mounted.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const root = process.argv[2];
if (!root) throw new Error('Task directory is required');
const original = fs.readFileSync(`${root}/original-image.txt`, 'utf8').trim();
const patched = fs.readFileSync(`${root}/patched-image.txt`, 'utf8').trim();
const fixed = `${patched}-runtime`;
const names = ['omniroute-original-native-copy', 'omniroute-polling-runtime-repair'];
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 });
const scan = `const fs=require("fs"),c=require("crypto"),out={};function walk(p){if(!fs.existsSync(p))return;for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=p+"/"+e.name;if(e.isDirectory())walk(f);else if(e.isFile()&&e.name.endsWith(".node"))out[f]=c.createHash("sha256").update(fs.readFileSync(f)).digest("hex");}}walk("/app/node_modules");walk("/app/src/mitm/tproxy/native");console.log(JSON.stringify(out));`;
try {
  for (const n of names) { try { docker('rm', '-f', '-v', n); } catch {} }
  docker('create', '--name', names[0], '--entrypoint', 'sleep', original, 'infinity');
  docker('create', '--name', names[1], '--entrypoint', 'sleep', patched, 'infinity');
  docker('start', names[1]);
  const file = '/app/src/mitm/tproxy/native/build/Release/transparent.node';
  docker('cp', `${names[0]}:${file}`, `${root}/transparent.node`);
  docker('exec', '--user', 'root', names[1], 'mkdir', '-p', '/app/src/mitm/tproxy/native/build/Release');
  docker('cp', `${root}/transparent.node`, `${names[1]}:${file}`);
  docker('exec', '--user', 'root', names[1], 'chmod', '755', file);
  docker('exec', names[1], 'node', '-e', `require(${JSON.stringify(file)});console.log("Original TPROXY binary loads on the unchanged Node runtime");`);
  docker('commit', '--change', 'ENTRYPOINT ["/app/check-permissions.sh"]', '--change', 'CMD ["node","dev/run-standalone.mjs"]', names[1], fixed);
  const a = JSON.parse(docker('run', '--rm', '--memory=512m', '--cpus=0.5', '--entrypoint', 'node', original, '-e', scan));
  const b = JSON.parse(docker('run', '--rm', '--memory=512m', '--cpus=0.5', '--entrypoint', 'node', fixed, '-e', scan));
  const missing = Object.keys(a).filter(p => !(p in b));
  const changed = Object.keys(a).filter(p => p in b && a[p] !== b[p]);
  console.log(JSON.stringify({ originalNativeFiles: Object.keys(a).length, preservedNativeFiles: Object.keys(a).length - missing.length - changed.length, missing, changed }));
  if (missing.length || changed.length) throw new Error('Original native runtime files were not preserved');
  fs.writeFileSync(`${root}/patched-image.txt`, `${fixed}\n`);
  console.log(`Repaired image ready: ${fixed}`);
} finally {
  for (const n of names) { try { docker('rm', '-f', '-v', n); } catch {} }
}
