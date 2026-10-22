import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {renderMeasuredResume} from '../src/utils/pdf.js';

test('PDF has A4 dimensions, native text mappings and embedded fonts instead of an image', async () => {
  const fonts={Inter:['400-normal','700-normal','400-italic','700-italic'].map(s=>fileURLToPath(new URL(`../node_modules/@fontsource/inter/files/inter-latin-${s}.woff`,import.meta.url)))};
  const blob=await renderMeasuredResume({height:400,boxes:[],runs:[{text:'Selectable resume text',x:48,y:48,width:400,height:20,style:{fontFamily:'Inter',fontSize:14,fontWeight:700,fontStyle:'italic',color:'#222222',letterSpacing:0,textDecoration:'underline'}}]},fonts);
  const bytes=Buffer.from(await blob.arrayBuffer()).toString('latin1');
  const bounds=bytes.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);
  assert.ok(bounds);
  assert.ok(Math.abs(Number(bounds[1])-595.28)<0.01);
  assert.ok(Math.abs(Number(bounds[2])-841.89)<0.01);
  assert.match(bytes,/\/ToUnicode/); assert.match(bytes,/\/FontFile2/);
  assert.doesNotMatch(bytes,/\/Subtype \/Image/);
});
