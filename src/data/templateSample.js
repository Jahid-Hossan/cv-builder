import { emptyResume } from "./resume.js";
const resume = emptyResume();
export const TEMPLATE_SAMPLE = {
  ...resume,
  personalInfo: {
    ...resume.personalInfo,
    fullName: "Alex Morgan",
    email: "alex@example.com",
    phone: "+44 7700 900000",
    location: "London, UK",
    website: "https://example.com",
    summary:
      "Product designer turning complex problems into clear, thoughtful experiences. Bringing curiosity, craft, and a practical approach to every project.",
  },
  experience: [
    {
      id: "sample-job-1",
      title: "Senior Product Designer",
      company: "Studio North",
      location: "London",
      startDate: "2022-01",
      endDate: "",
      current: true,
      description:
        "Led the design of accessible digital products. Worked with engineering and research teams to turn insights into useful customer experiences.",
    },
    {
      id: "sample-job-2",
      title: "Product Designer",
      company: "Forma Studio",
      location: "London",
      startDate: "2019-06",
      endDate: "2021-12",
      current: false,
      description:
        "Designed clear user journeys and helped build a consistent design system.",
    },
  ],
  education: [
    {
      id: "sample-education",
      institution: "University of the Arts",
      degree: "BA",
      field: "Design & Communication",
      startDate: "2015-09",
      endDate: "2018-06",
    },
  ],
  skills: [
    {
      id: "sample-skills",
      category: "Design",
      items: ["Product design", "Research", "Prototyping", "Design systems"],
    },
  ],
  projects: [
    {
      id: "sample-project",
      name: "Wayfinding",
      link: "https://example.com",
      description: "A simpler way to find and explore local places.",
    },
  ],
  certifications: [
    {
      id: "sample-certification",
      name: "Accessible Design",
      issuer: "Design Academy",
      date: "2023-04",
    },
  ],
};
