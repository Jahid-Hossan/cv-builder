export const SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
];
export const TEMPLATES = [
  {
    id: "ats",
    name: "ATS Professional",
    description: "Clean, single-column clarity. Built for easy scanning.",
  },
  {
    id: "modern",
    name: "Modern",
    description: "A confident sidebar with space for your skills.",
  },
  {
    id: "executive",
    name: "Executive",
    description: "A considered corporate layout. Experience comes first.",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Expressive headings and a portfolio-friendly rhythm.",
  },
];
export const FONTS = {
  Inter: "Inter, Arial, sans-serif",
  Arial: "Arial, sans-serif",
  Georgia: "Georgia, serif",
  Helvetica: "Helvetica, Arial, sans-serif",
};
export function emptyResume() {
  return {
    version: 1,
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    sectionOrder: [...SECTION_ORDER],
    settings: {
      template: "modern",
      primaryColor: "#2563eb",
      fontFamily: "Inter",
    },
  };
}
export const ITEM_FIELDS = {
  experience: [
    "title",
    "company",
    "location",
    "startDate",
    "endDate",
    "current",
    "description",
  ],
  education: ["institution", "degree", "field", "startDate", "endDate"],
  skills: ["category", "items"],
  projects: ["name", "link", "description"],
  certifications: ["name", "issuer", "date"],
};
export function newItem(section) {
  return Object.fromEntries([
    ["id", crypto.randomUUID()],
    ...ITEM_FIELDS[section].map((k) => [
      k,
      k === "items" ? [] : k === "current" ? false : "",
    ]),
  ]);
}
