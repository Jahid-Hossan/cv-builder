import test from 'node:test';
import assert from 'node:assert/strict';
import { experienceHtml, descriptionHtml, descriptionLength } from '../src/utils/richText.js';
import { emptyResume, newItem } from '../src/data/resume.js';
import { parseBackup, serializeBackup, loadResume, saveResume, validateBackup } from '../src/utils/resume.js';
import { paginateText } from '../src/utils/pdf.js';

test('legacy descriptions migrate without changing other fields or overwriting on load', () => {
  const d = emptyResume();
  d.experience = [{ ...newItem('experience'), description: 'Built <widgets> & tools\nSecond line' }];
  const raw = JSON.stringify(d);
  const storage = { value: raw, getItem() { return this.value; }, setItem(k,v) { this.value = v; } };
  const restored = loadResume(storage);
  assert.equal(storage.value, raw);
  assert.equal(restored.experience[0].description, '<p>Built &lt;widgets&gt; &amp; tools<br>Second line</p>');
  assert.deepEqual({ ...restored, experience: d.experience }, d);
  saveResume(storage, restored);
  assert.deepEqual(loadResume(storage), restored);
});

test('literal HTML in a legacy description is preserved rather than interpreted', () => {
  const d = emptyResume();
  d.experience = [{ ...newItem('experience'), description: '<p>literal markup</p>' }];
  const restored = parseBackup(JSON.stringify(d));
  assert.equal(restored.experience[0].description, '<p>&lt;p&gt;literal markup&lt;/p&gt;</p>');
  assert.equal(restored.experience[0].descriptionFormat, 'html');
  assert.deepEqual(parseBackup(serializeBackup(restored)), restored);
});

test('formatting round trips; length limits apply to text instead of HTML markup', () => {
  const html = '<p><strong>Led</strong> <em>delivery</em> <u>on time</u></p><ul><li><p>Built tools</p></li></ul>';
  const d = emptyResume();
  d.experience = [{ ...newItem('experience'), description: html, descriptionFormat: 'html' }];
  assert.equal(parseBackup(serializeBackup(d)).experience[0].description, html);
  d.experience[0].description = `<p><strong>${'a'.repeat(2000)}</strong></p>`;
  assert.ok(validateBackup(d));
  d.experience[0].description = `<p>${'a'.repeat(2001)}</p>`;
  assert.equal(validateBackup(d), false);
  assert.equal(descriptionLength('<p>A &amp; B<br>C</p>'), 7);
});

test('active content, attributes and unsupported pasted markup cannot reach the preview', () => {
  const dirty = '<p onclick="evil()"><strong>Keep</strong><script>alert(1)</script><img src=x onerror=evil()><a href="javascript:evil()"> safe text</a></p>';
  assert.equal(descriptionHtml(dirty), '<p><strong>Keep</strong> safe text</p>');
  assert.equal(experienceHtml({description: '<b>literal</b>'}), '<p>&lt;b&gt;literal&lt;/b&gt;</p>');
});

test('pagination avoids cutting lines, including overlapping sidebar lines', () => {
  const runs = [{y:1080,height:20},{y:1070,height:40},{y:2100,height:25}];
  const pages = paginateText(runs,2300);
  assert.equal(pages[0].end,1070);
  for (const r of runs) assert.equal(pages.filter(p=>r.y>=p.start && r.y+r.height<=p.end).length,1);
});
