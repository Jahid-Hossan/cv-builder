"use client";
import Link from "next/link";
import { TEMPLATES } from "../data/resume";
import { useResume } from "../context/ResumeContext";
export default function TemplateGallery() {
  const { data, setData, ready } = useResume();
  return (
    <main className="gallery">
      <p className="eyebrow">FOUR WAYS TO TELL YOUR STORY</p>
      <h1>Find your fit.</h1>
      <p className="gallery-intro">
        Choose a starting point. Switch any time—your experience comes with you.
      </p>
      <div className="template-grid">
        {TEMPLATES.map((t, i) => (
          <article className="template-card" key={t.id}>
            <div className={`template-mini mini-${t.id}`} aria-hidden="true">
              <div className="mini-head">
                <strong>Alex Morgan</strong>
                <small>
                  {i === 2 ? "STRATEGY & LEADERSHIP" : "YOUR NEXT CHAPTER"}
                </small>
              </div>
              <div className="mini-body">
                {["PROFILE", "EXPERIENCE", "EDUCATION", "SKILLS"].map(
                  (label) => (
                    <div key={label}>
                      <b>{label}</b>
                      <i />
                      <i />
                      <i />
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="template-info">
              <h2>{t.name}</h2>
              <p>{t.description}</p>
              <Link
                className="template-select"
                href="/builder"
                aria-disabled={!ready}
                onClick={(e) => {
                  if (!ready) {
                    e.preventDefault();
                    return;
                  }
                  setData((d) => ({
                    ...d,
                    settings: { ...d.settings, template: t.id },
                  }));
                }}
              >
                Use template <span aria-hidden="true">↗</span>
              </Link>
              {data.settings.template === t.id && (
                <span className="selected-label">Current template</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
