import test from "node:test";
import assert from "node:assert/strict";
import { emptyResume } from "../src/data/resume.js";
import {
  validatePersonal,
  validateBackup,
  parseBackup,
  serializeBackup,
  loadResume,
  saveResume,
  reorderSections,
  STORAGE_KEY,
  INVALID_BACKUP,
} from "../src/utils/resume.js";
const storage = () => {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
  };
};
test("blank drafts retain exact version-1 shape and export/import", () => {
  const d = emptyResume();
  assert.ok(validateBackup(d));
  assert.deepEqual(parseBackup(serializeBackup(d)), d);
});
test("personal validation checks required fields, email, URLs, length", () => {
  const p = emptyResume().personalInfo;
  assert.equal(Object.keys(validatePersonal(p)).length, 2);
  Object.assign(p, {
    fullName: "Alex",
    email: "alex@example.com",
    website: "https://example.com",
  });
  assert.deepEqual(validatePersonal(p), {});
  p.linkedin = "javascript:alert(1)";
  p.summary = "a".repeat(1001);
  p.email = "not-email";
  assert.equal(Object.keys(validatePersonal(p)).length, 3);
});
test("invalid imports reject version, missing data, unsafe settings and duplicate order", () => {
  for (const text of ["invalid", "null", "{}", '{"version":2}'])
    assert.throws(() => parseBackup(text), { message: INVALID_BACKUP });
  for (const change of [
    (d) => (d.version = 2),
    (d) => delete d.personalInfo,
    (d) => delete d.settings,
    (d) => (d.settings.primaryColor = "red"),
    (d) => (d.settings.fontFamily = "toString"),
    (d) => d.sectionOrder.fill("skills"),
    (d) => (d.experience = [{ id: "x" }]),
  ]) {
    const d = emptyResume();
    change(d);
    assert.equal(validateBackup(d), false);
  }
});
test("save and restore includes settings, content and section order", () => {
  const s = storage(),
    d = emptyResume();
  d.personalInfo.fullName = "Test";
  d.settings.template = "creative";
  d.sectionOrder = reorderSections(d.sectionOrder, "skills", "summary");
  saveResume(s, d);
  assert.deepEqual(loadResume(s), d);
  assert.ok(s.getItem(STORAGE_KEY));
});
test("missing storage is null; corrupt or unavailable storage fails safely", () => {
  assert.equal(loadResume(storage()), null);
  assert.throws(() => loadResume({ getItem: () => "{bad" }));
  assert.throws(() =>
    saveResume(
      {
        setItem: () => {
          throw Error("quota");
        },
      },
      emptyResume(),
    ),
  );
});
test("ordering preserves each section once and handles missing drop targets", () => {
  const order = emptyResume().sectionOrder;
  const moved = reorderSections(order, "certifications", "summary");
  assert.equal(moved[0], "certifications");
  assert.deepEqual([...moved].sort(), [...order].sort());
  assert.equal(reorderSections(order, "missing", "summary"), order);
});
test("array validation rejects duplicates, wrong skills and long descriptions", () => {
  const d = emptyResume();
  d.skills = [{ id: "1", category: "Dev", items: [1] }];
  assert.equal(validateBackup(d), false);
  d.skills = [{ id: "1", category: "Dev", items: ["JS"] }];
  assert.ok(validateBackup(d));
  d.skills.push(d.skills[0]);
  assert.equal(validateBackup(d), false);
});

test("all 15 templates retain version-1 persistence compatibility", async () => {
  const { TEMPLATES } = await import("../src/data/resume.js");
  assert.equal(TEMPLATES.length, 15);
  assert.equal(new Set(TEMPLATES.map((t) => t.id)).size, 15);
  for (const t of TEMPLATES) {
    const d = emptyResume();
    d.settings.template = t.id;
    assert.deepEqual(parseBackup(serializeBackup(d)), d);
  }
});
test("new font styles are optional for legacy resumes and validated when present", async () => {
  const { FONTS, FONT_STYLES } = await import("../src/data/resume.js");
  const d = emptyResume();
  assert.ok(validateBackup(d));
  for (const fontFamily of Object.keys(FONTS))
    for (const fontStyle of Object.keys(FONT_STYLES)) {
      d.settings = { ...d.settings, fontFamily, fontStyle };
      assert.deepEqual(parseBackup(serializeBackup(d)), d);
    }
  d.settings.fontStyle = "invalid-style";
  assert.equal(validateBackup(d), false);
});

test("retired fonts migrate without losing saved resume content or settings", async () => {
  const { FONTS, LEGACY_FONT_REPLACEMENTS } = await import("../src/data/resume.js");
  assert.deepEqual(Object.keys(FONTS), ["Inter", "Merriweather"]);
  for (const [oldFont, newFont] of Object.entries(LEGACY_FONT_REPLACEMENTS)) {
    const original = emptyResume();
    original.personalInfo.fullName = "Existing draft";
    original.personalInfo.summary = "Keep my original text.";
    original.settings = { ...original.settings, fontFamily: oldFont, fontStyle: "bold-italic", template: "executive" };
    original.skills = [{ id: "saved-skill", category: "Development", items: ["JavaScript"] }];
    const saved = storage();
    saved.setItem(STORAGE_KEY, JSON.stringify(original));
    const restored = loadResume(saved);
    assert.deepEqual(restored, { ...original, settings: { ...original.settings, fontFamily: newFont } });
    saveResume(saved, restored);
    assert.deepEqual(loadResume(saved), restored);
    assert.equal(original.settings.fontFamily, oldFont);
  }
  const invalid = emptyResume();
  invalid.settings.fontFamily = "__proto__";
  assert.throws(() => parseBackup(JSON.stringify(invalid)), { message: INVALID_BACKUP });
});
