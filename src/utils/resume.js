import {
  SECTION_ORDER,
  ITEM_FIELDS,
  TEMPLATES,
  FONTS,
} from "../data/resume.js";
export const STORAGE_KEY = "resume-builder-data";
export const INVALID_BACKUP = "Selected file is not a valid resume backup.";
export const STORAGE_ERROR = "Unable to save locally. Download a JSON backup.";
export const isUrl = (value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
export function validatePersonal(info) {
  const errors = {};
  if (!info.fullName.trim()) errors.fullName = "Full Name is required.";
  if (!info.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email))
    errors.email = "Enter a valid email address.";
  for (const field of ["website", "linkedin"])
    if (info[field] && !isUrl(info[field]))
      errors[field] = "Enter a valid http or https URL.";
  if (info.summary.length > 1000)
    errors.summary = "Summary must be 1000 characters or fewer.";
  return errors;
}
export function validateBackup(data) {
  if (!data || typeof data !== "object" || data.version !== 1) return false;
  const strings = [
    "fullName",
    "email",
    "phone",
    "location",
    "website",
    "linkedin",
    "summary",
  ];
  if (
    !data.personalInfo ||
    !strings.every((k) => typeof data.personalInfo[k] === "string")
  )
    return false;
  if (data.personalInfo.summary.length > 1000) return false;
  if (
    !data.settings ||
    !TEMPLATES.some((t) => t.id === data.settings.template) ||
    !/^#[0-9a-f]{6}$/i.test(data.settings.primaryColor) ||
    !Object.hasOwn(FONTS, data.settings.fontFamily)
  )
    return false;
  if (
    !Array.isArray(data.sectionOrder) ||
    data.sectionOrder.length !== SECTION_ORDER.length ||
    new Set(data.sectionOrder).size !== SECTION_ORDER.length ||
    !data.sectionOrder.every((k) => SECTION_ORDER.includes(k))
  )
    return false;
  return Object.entries(ITEM_FIELDS).every(
    ([section, fields]) =>
      Array.isArray(data[section]) &&
      new Set(data[section].map((x) => x?.id)).size === data[section].length &&
      data[section].every(
        (item) =>
          item &&
          typeof item.id === "string" &&
          item.id.length > 0 &&
          fields.every((k) =>
            k === "items"
              ? Array.isArray(item[k]) &&
                item[k].every((v) => typeof v === "string")
              : k === "current"
                ? typeof item[k] === "boolean"
                : typeof item[k] === "string",
          ) &&
          (!item.description ||
            section !== "experience" ||
            item.description.length <= 2000),
      ),
  );
}
export function parseBackup(text) {
  try {
    const data = JSON.parse(text);
    if (validateBackup(data)) return data;
  } catch {}
  throw new Error(INVALID_BACKUP);
}
export function serializeBackup(data) {
  if (!validateBackup(data)) throw new Error(INVALID_BACKUP);
  return JSON.stringify(data, null, 2);
}
export function loadResume(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  return raw === null ? null : parseBackup(raw);
}
export function saveResume(storage, data) {
  storage.setItem(STORAGE_KEY, serializeBackup(data));
}
export function reorderSections(order, active, over) {
  const from = order.indexOf(active),
    to = order.indexOf(over);
  if (from < 0 || to < 0 || from === to) return order;
  const result = [...order];
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
}
export function downloadBackup(data) {
  const blob = new Blob([serializeBackup(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
