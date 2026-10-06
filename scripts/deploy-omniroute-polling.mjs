// Runs locally on the VPS, in an ephemeral Node container with the Docker socket.
// Never prints container environment values or reads them back to the agent.
import http from 'node:http';
import fs from 'node:fs';
const root = '/task';
const original = JSON.parse(fs.readFileSync(`${root}/original-container.json`, 'utf8'))[0];
const image = fs.readFileSync(`${root}/patched-image.txt`, 'utf8').trim();
const commit = fs.readFileSync(`${root}/patch-commit.txt`, 'utf8').trim();
const short = commit.slice(0, 8), candidate = `omniroute-polling-smoke-${short}`, backup = `omniroute-backup-${short}`;
function api(method, route, body) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : JSON.stringify(body);
    const req = http.request({ socketPath: '/var/run/docker.sock', path: route, method, headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {} }, res => {
      const chunks = []; res.on('data', c => chunks.push(c)); res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`Docker ${method} ${route.split('?')[0]} returned ${res.statusCode}`));
        try { resolve(text ? JSON.parse(text) : null); } catch { resolve(text); }
      });
    }); req.on('error', reject); req.end(data);
  });
}
async function exec(container, cmd) {
  const e = await api('POST', `/containers/${container}/exec`, { Cmd: cmd, AttachStdout: false, AttachStderr: false });
  await api('POST', `/exec/${e.Id}/start`, { Detach: true, Tty: false });
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    const status = await api('GET', `/exec/${e.Id}/json`);
    if (!status.Running && status.ExitCode !== null) {
      if (status.ExitCode === 0) return;
      const error = new Error(`Container check failed (${status.ExitCode})`);
      error.exitCode = status.ExitCode;
      throw error;
    }
    await sleep(100);
  }
  throw new Error('Docker command did not finish within 120 seconds');
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function healthy(container) {
  const deadline = Date.now() + 90000;
  let last;
  while (Date.now() < deadline) {
    try { await exec(container, ['node', '-e', 'fetch("http://127.0.0.1:20128/api/health/ping",{signal:AbortSignal.timeout(2500)}).then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))']); return; } catch (error) { last = error; await sleep(3000); }
  }
  throw new Error(`Health check did not succeed: ${last?.message}`);
}
const live = await api('GET', '/containers/omniroute/json');
if (live.Image !== original.Image) throw new Error('Live image changed since build; refusing to replace it');
await exec('omniroute', ['node', '-e', 'setTimeout(()=>process.exit(0),250)']);
let negativeCheckRejected = false;
try { await exec('omniroute', ['node', '-e', 'setTimeout(()=>process.exit(7),250)']); } catch (error) { if (error.exitCode !== 7) throw error; negativeCheckRejected = true; }
if (!negativeCheckRejected) throw new Error('Docker command exit-code verification failed');
console.log('Docker command completion checks: delayed success accepted; delayed exit 7 rejected.');
const patchImage = await api('GET', `/images/${encodeURIComponent(image)}/json`);
let smokeId, replacementId, renamed = false, stopped = false;
const disconnected = [];
const networks = live.NetworkSettings.Networks;
try {
  const smoke = await api('POST', `/containers/create?name=${candidate}`, {
    Image: image, Entrypoint: live.Config.Entrypoint, Cmd: live.Config.Cmd,
    Env: [...(patchImage.Config.Env || []).filter(e => !/^(PORT|HOSTNAME|DATA_DIR|NODE_ENV|OMNIROUTE_MEMORY_MB)=/.test(e)), ...(live.Config.Env || []).filter(e => /^(PORT|HOSTNAME|DATA_DIR|NODE_ENV|OMNIROUTE_MEMORY_MB)=/.test(e))], WorkingDir: live.Config.WorkingDir, User: live.Config.User,
    HostConfig: { Memory: 2147483648, NanoCpus: 500000000, RestartPolicy: { Name: 'no' } }
  });
  smokeId = smoke.Id;
  await api('POST', `/containers/${smokeId}/start`); await healthy(smokeId);
  await exec(smokeId, ['node', '-e', 'const fs=require("fs");for(const f of ["ProviderTestSlideOver.tsx","MaintenanceBanner.tsx","RequestLoggerV2.tsx"]){if(!fs.readFileSync("/app/src/shared/components/"+f,"utf8").includes("startVisiblePolling"))process.exit(1)}if(!fs.readFileSync("/app/src/app/(dashboard)/dashboard/HomePageClient.tsx","utf8").includes("interval: 60000"))process.exit(1)']);
  console.log('Candidate starts and health endpoint returns 200; source patch assertions succeed.');
  await api('POST', `/containers/${smokeId}/stop?t=15`);
  await exec('omniroute', ['node', '-e', `const fs=require("fs"),DB=require("better-sqlite3");const dir=process.env.DATA_DIR||"/app/data";fs.mkdirSync(dir+"/backups",{recursive:true});const db=new DB(process.env.SQLITE_FILE||dir+"/storage.sqlite",{readonly:true});db.backup(dir+"/backups/polling-${short}.sqlite").then(()=>db.close()).catch(()=>process.exit(1));`]);
  console.log('SQLite online backup created in the existing data volume.');
  await api('POST', '/containers/omniroute/stop?t=30'); stopped = true;
  await api('POST', `/containers/omniroute/rename?name=${backup}`); renamed = true;
  for (const [name, n] of Object.entries(networks)) {
    await api('POST', `/networks/${n.NetworkID}/disconnect`, { Container: live.Id, Force: false }); disconnected.push(name);
  }
  const endpoints = {};
  for (const [name, n] of Object.entries(networks)) endpoints[name] = { Aliases: (n.Aliases || []).filter(a => a !== live.Id && a !== live.Id.slice(0, 12)), ...(n.IPAMConfig ? { IPAMConfig: n.IPAMConfig } : {}) };
  const replacement = await api('POST', '/containers/create?name=omniroute', { ...live.Config, Image: image, HostConfig: { ...live.HostConfig, AutoRemove: false }, NetworkingConfig: { EndpointsConfig: endpoints } });
  replacementId = replacement.Id;
  await api('POST', `/containers/${replacementId}/start`); await healthy(replacementId);
  await exec(replacementId, ['node', '-e', 'fetch("http://127.0.0.1:20128/dashboard",{redirect:"manual"}).then(r=>process.exit([200,301,302,303,307,308].includes(r.status)?0:1)).catch(()=>process.exit(1))']);
  const ready = await api('GET', '/containers/omniroute/json');
  const beforeMount = live.Mounts.find(m => m.Destination === '/app/data');
  const afterMount = ready.Mounts.find(m => m.Destination === '/app/data');
  if (!beforeMount || !afterMount || beforeMount.Source !== afterMount.Source) throw new Error('Data volume mismatch');
  fs.writeFileSync(`${root}/deployed.json`, JSON.stringify({ commit, image, backup, deployedAt: new Date().toISOString(), dataVolumePreserved: true }, null, 2));
  console.log(JSON.stringify({ image, commit, backup, healthStatus: 200, dataVolumePreserved: true, deployedAt: new Date().toISOString() }));
} catch (error) {
  if (replacementId) { await api('POST', `/containers/${replacementId}/stop?t=15`).catch(()=>{}); await api('DELETE', `/containers/${replacementId}`).catch(()=>{}); }
  if (renamed) await api('POST', `/containers/${live.Id}/rename?name=omniroute`).catch(()=>{});
  for (const name of disconnected) await api('POST', `/networks/${networks[name].NetworkID}/connect`, { Container: live.Id, EndpointConfig: { Aliases: networks[name].Aliases, ...(networks[name].IPAMConfig ? { IPAMConfig: networks[name].IPAMConfig } : {}) } }).catch(()=>{});
  if (stopped) { await api('POST', `/containers/${live.Id}/start`); await healthy(live.Id); console.log('Original OmniRoute restored and health check succeeded.'); }
  throw error;
} finally {
  if (smokeId) { await api('POST', `/containers/${smokeId}/stop?t=10`).catch(()=>{}); await api('DELETE', `/containers/${smokeId}?v=true`).catch(()=>{}); }
}
