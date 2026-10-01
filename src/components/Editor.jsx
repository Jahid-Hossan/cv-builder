"use client";
import { useForm } from "react-hook-form";
import { useResume } from "../context/ResumeContext";
import { ITEM_FIELDS, newItem } from "../data/resume";
import { isUrl } from "../utils/resume";
import SectionOrder from "./SectionOrder";
const labels = {
  fullName: "Full Name",
  email: "Email",
  phone: "Phone",
  location: "Location",
  website: "Website",
  linkedin: "LinkedIn",
  summary: "Summary",
  title: "Title",
  company: "Company",
  startDate: "Start Date",
  endDate: "End Date",
  current: "Current Position",
  description: "Description",
  institution: "Institution",
  degree: "Degree",
  field: "Field",
  category: "Category",
  items: "Skills (comma-separated)",
  name: "Name",
  link: "Link",
  issuer: "Issuer",
  date: "Date",
};
const empty = {
  experience: "Add your first experience",
  education: "Add your first education entry",
  skills: "Add your first skill category",
  projects: "Add your first project",
  certifications: "Add your first certification",
};
export default function Editor() {
  const { data, setData } = useResume();
  return (
    <div className="editor-stack">
      <Personal />
      {Object.keys(ITEM_FIELDS).map((section, index) => (
        <details
          className="editor-card"
          key={section}
          open={section === "experience"}
        >
          <summary>
            <span className="section-index">
              {String(index + 2).padStart(2, "0")}
            </span>
            <h2>{section}</h2>
            <span className="count">{data[section].length}</span>
          </summary>
          <div className="card-body">
            {!data[section].length && (
              <p className="empty-state">{empty[section]}</p>
            )}
            {data[section].map((item, i) => (
              <Item key={item.id} section={section} item={item} index={i} />
            ))}
            <button
              type="button"
              className="add-button"
              onClick={() =>
                setData((d) => ({
                  ...d,
                  [section]: [...d[section], newItem(section)],
                }))
              }
            >
              + Add{" "}
              {section === "skills"
                ? "skill category"
                : section === "experience"
                  ? "experience"
                  : section === "education"
                    ? "education entry"
                    : section === "projects"
                      ? "project"
                      : "certification"}
            </button>
          </div>
        </details>
      ))}
      <details className="editor-card">
        <summary>
          <span className="section-index">07</span>
          <h2>Section order</h2>
        </summary>
        <div className="card-body">
          <SectionOrder
            order={data.sectionOrder}
            onChange={(sectionOrder) =>
              setData((d) => ({ ...d, sectionOrder }))
            }
          />
        </div>
      </details>
    </div>
  );
}
function Personal() {
  const { data, setData } = useResume();
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "onChange", defaultValues: data.personalInfo });
  return (
    <section className="editor-card">
      <div className="card-heading">
        <span className="section-index">01</span>
        <h2>Personal information</h2>
      </div>
      <div className="card-body field-grid">
        {Object.keys(data.personalInfo).map((field) => {
          const rules = {
            onChange: (e) =>
              setData((d) => ({
                ...d,
                personalInfo: { ...d.personalInfo, [field]: e.target.value },
              })),
          };
          if (["fullName", "email"].includes(field))
            rules.required = `${labels[field]} is required.`;
          if (field === "fullName")
            rules.validate = (v) =>
              Boolean(v.trim()) || "Full Name is required.";
          if (field === "email")
            rules.pattern = {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address.",
            };
          if (["website", "linkedin"].includes(field))
            rules.validate = (v) =>
              !v || isUrl(v) || "Enter a valid http or https URL.";
          if (field === "summary")
            rules.maxLength = {
              value: 1000,
              message: "Summary must be 1000 characters or fewer.",
            };
          const id = `personal-${field}`;
          return (
            <div
              key={field}
              className={
                ["summary", "fullName"].includes(field) ? "field full" : "field"
              }
            >
              <label htmlFor={id}>
                {labels[field]}
                {["fullName", "email"].includes(field) && (
                  <span aria-hidden="true"> *</span>
                )}
              </label>
              {field === "summary" ? (
                <textarea
                  id={id}
                  rows={5}
                  maxLength={1000}
                  {...register(field, rules)}
                  aria-invalid={!!errors[field]}
                  aria-describedby={`${id}-help`}
                />
              ) : (
                <input
                  id={id}
                  type={
                    field === "email"
                      ? "email"
                      : field === "phone"
                        ? "tel"
                        : ["website", "linkedin"].includes(field)
                          ? "url"
                          : "text"
                  }
                  {...register(field, rules)}
                  aria-required={["fullName", "email"].includes(field)}
                  aria-invalid={!!errors[field]}
                  aria-describedby={`${id}-help`}
                />
              )}
              <p
                id={`${id}-help`}
                className={errors[field] ? "field-error" : "help"}
              >
                {errors[field]?.message ||
                  (field === "summary"
                    ? `${data.personalInfo.summary.length}/1000 characters`
                    : null)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
function Item({ section, item, index }) {
  const { setData } = useResume();
  const {
    register,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...item, items: item.items?.join(", ") },
  });
  function update(field, value) {
    setData((d) => ({
      ...d,
      [section]: d[section].map((x) =>
        x.id === item.id ? { ...x, [field]: value } : x,
      ),
    }));
  }
  return (
    <fieldset className="item-card">
      <legend>
        {section === "skills" ? "Category" : "Entry"} {index + 1}
      </legend>
      <div className="item-actions">
        <button
          type="button"
          className="delete-button"
          aria-label={`Delete ${section} entry ${index + 1}`}
          onClick={() =>
            setData((d) => ({
              ...d,
              [section]: d[section].filter((x) => x.id !== item.id),
            }))
          }
        >
          Delete
        </button>
      </div>
      <div className="field-grid">
        {ITEM_FIELDS[section].map((field) => {
          const id = `${item.id}-${field}`,
            rules = {
              onChange: (e) =>
                update(
                  field,
                  field === "current"
                    ? e.target.checked
                    : field === "items"
                      ? e.target.value
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean)
                      : e.target.value,
                ),
            };
          if (section === "experience" && field === "description")
            rules.maxLength = {
              value: 2000,
              message: "Description must be 2000 characters or fewer.",
            };
          return (
            <div
              key={field}
              className={`field ${["description", "items", "current"].includes(field) ? "full" : ""}`}
            >
              <label htmlFor={id}>{labels[field]}</label>
              {field === "description" ? (
                <textarea
                  id={id}
                  rows={4}
                  maxLength={section === "experience" ? 2000 : undefined}
                  {...register(field, rules)}
                  aria-invalid={!!errors[field]}
                  aria-describedby={`${id}-error`}
                />
              ) : (
                <input
                  id={id}
                  type={
                    field === "current"
                      ? "checkbox"
                      : /Date|^date$/.test(field)
                        ? "month"
                        : "text"
                  }
                  disabled={field === "endDate" && item.current}
                  {...register(field, rules)}
                  aria-invalid={!!errors[field]}
                  aria-describedby={`${id}-error`}
                />
              )}
              <p id={`${id}-error`} className="field-error">
                {errors[field]?.message}
              </p>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
