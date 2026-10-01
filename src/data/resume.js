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
  {
    id: "minimal",
    name: "Minimal",
    description: "Quiet typography and clean open space.",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional serif styling and centered details.",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "A refined frame with delicate section rules.",
  },
  {
    id: "compact",
    name: "Compact",
    description: "A concise layout for experience-rich resumes.",
  },
  {
    id: "academic",
    name: "Academic",
    description: "Scholarly headings and formal section structure.",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Precise geometry with defined skill blocks.",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "A clear visual thread through your career.",
  },
  {
    id: "bold",
    name: "Bold",
    description: "A strong color header and confident typography.",
  },
  {
    id: "nordic",
    name: "Nordic",
    description: "Airy spacing and understated accent details.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Project cards and a distinctive personal header.",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Large display headings and an editorial rhythm.",
  },
];
export const FONTS = {
  Inter: "Inter, Arial, sans-serif",
  Arial: "Arial, sans-serif",
  Georgia: "Georgia, serif",
  Helvetica: "Helvetica, Arial, sans-serif",
  Lato: "Lato, Arial, sans-serif",
  Roboto: "Roboto, Arial, sans-serif",
  Montserrat: "Montserrat, Arial, sans-serif",
  Merriweather: "Merriweather, Georgia, serif",
  "Source Sans 3": '"Source Sans 3", Arial, sans-serif',
  Nunito: "Nunito, Arial, sans-serif",
};
export const FONT_STYLES = {
  normal: "Normal",
  bold: "Bold",
  italic: "Italic",
  "bold-italic": "Bold italic",
};
export const COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Navy", value: "#1e3a5f" },
  { name: "Forest", value: "#205c4c" },
  { name: "Teal", value: "#0f766e" },
  { name: "Emerald", value: "#047857" },
  { name: "Indigo", value: "#4338ca" },
  { name: "Purple", value: "#7e22ce" },
  { name: "Burgundy", value: "#881337" },
  { name: "Rose", value: "#be123c" },
  { name: "Rust", value: "#9a3412" },
  { name: "Bronze", value: "#854d0e" },
  { name: "Charcoal", value: "#334155" },
];
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
