"use client";
import { forwardRef, memo } from "react";
import { FONTS } from "../data/resume";
import { isUrl } from "../utils/resume";
export function SafeLink({ value }) {
  return isUrl(value) ? (
    <a href={value} target="_blank" rel="noreferrer">
      {value.replace(/^https?:\/\//, "")}
    </a>
  ) : (
    <span>{value}</span>
  );
}
const labels = {
  summary: "Profile",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
};
function dates(item) {
  return [item.startDate, item.current ? "Present" : item.endDate]
    .filter(Boolean)
    .join(" — ");
}
function Section({ name, data }) {
  if (name === "summary")
    return data.personalInfo.summary ? (
      <section className="resume-section" data-section={name}>
        <h2>{labels[name]}</h2>
        <p>{data.personalInfo.summary}</p>
      </section>
    ) : null;
  if (!data[name].length) return null;
  return (
    <section className="resume-section" data-section={name}>
      <h2>{labels[name]}</h2>
      {data[name].map((item) => (
        <div className="resume-entry" key={item.id}>
          {name === "experience" && (
            <>
              <div className="entry-title">
                <h3>{item.title || "Position"}</h3>
                <span>{dates(item)}</span>
              </div>
              <p className="entry-meta">
                {[item.company, item.location].filter(Boolean).join(" · ")}
              </p>
              <p>{item.description}</p>
            </>
          )}
          {name === "education" && (
            <>
              <div className="entry-title">
                <h3>{item.institution || "Institution"}</h3>
                <span>{dates(item)}</span>
              </div>
              <p>{[item.degree, item.field].filter(Boolean).join(" · ")}</p>
            </>
          )}
          {name === "skills" && (
            <>
              <h3>{item.category || "Skills"}</h3>
              <p className="skill-list">{item.items.join(" · ")}</p>
            </>
          )}
          {name === "projects" && (
            <>
              <h3>{item.name || "Project"}</h3>
              {item.link && <SafeLink value={item.link} />}
              <p>{item.description}</p>
            </>
          )}
          {name === "certifications" && (
            <>
              <div className="entry-title">
                <h3>{item.name || "Certification"}</h3>
                <span>{item.date}</span>
              </div>
              <p>{item.issuer}</p>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
const ResumePreview = memo(
  forwardRef(function ResumePreview({ data }, ref) {
    const p = data.personalInfo;
    const channels = [1, 3, 5].map((start) =>
      parseInt(data.settings.primaryColor.slice(start, start + 2), 16),
    );
    const sidebarColor = `rgb(${channels.map((n) => Math.round(n * 0.12 + 255 * 0.88)).join(", ")})`;
    return (
      <article
        ref={ref}
        className={`resume-paper template-${data.settings.template}`}
        style={{
          "--resume-color": data.settings.primaryColor,
          "--sidebar-color": sidebarColor,
          fontFamily: FONTS[data.settings.fontFamily],
          fontStyle: data.settings.fontStyle?.includes("italic")
            ? "italic"
            : "normal",
          fontWeight: data.settings.fontStyle?.includes("bold") ? 700 : 400,
        }}
        aria-label="Resume preview"
      >
        <header className="resume-header">
          <p className="resume-kicker">
            {data.settings.template === "creative" ? "CURRICULUM VITAE" : null}
          </p>
          <h1>{p.fullName || "Your name"}</h1>
          <div className="resume-contact">
            {[p.email, p.phone, p.location].filter(Boolean).map((v, i) => (
              <span key={i}>{v}</span>
            ))}
            {p.website && <SafeLink value={p.website} />}{" "}
            {p.linkedin && <SafeLink value={p.linkedin} />}
          </div>
        </header>
        <div className="resume-body">
          {data.sectionOrder.map((name) => (
            <Section key={name} name={name} data={data} />
          ))}
        </div>
        {!p.summary &&
          !data.experience.length &&
          !data.education.length &&
          !data.skills.length &&
          !data.projects.length &&
          !data.certifications.length && (
            <p className="preview-empty">
              Your story starts here. Add your details to see your resume take
              shape.
            </p>
          )}
      </article>
    );
  }),
);
export default ResumePreview;
