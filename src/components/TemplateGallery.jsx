"use client";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { TEMPLATES } from "../data/resume";
import { TEMPLATE_SAMPLE } from "../data/templateSample";
import { useResume } from "../context/ResumeContext";
import PreviewViewport from "./PreviewViewport";
function TemplateThumbnail({ template }) {
  const paperRef = useRef(null);
  const data = useMemo(
    () => ({
      ...TEMPLATE_SAMPLE,
      settings: { ...TEMPLATE_SAMPLE.settings, template },
    }),
    [template],
  );
  return (
    <div className="template-thumbnail" aria-hidden="true" inert>
      <PreviewViewport data={data} paperRef={paperRef} />
    </div>
  );
}
export default function TemplateGallery() {
  const { data, setData, ready } = useResume();
  return (
    <main className="gallery">
      <p className="eyebrow">15 WAYS TO TELL YOUR STORY</p>
      <h1>Find your fit.</h1>
      <p className="gallery-intro">
        Choose a starting point. Switch any time—your experience comes with you.
      </p>
      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <article className="template-card" key={t.id}>
            <TemplateThumbnail template={t.id} />
            <div className="template-info">
              <h2>{t.name}</h2>
              <Link
                className="template-select"
                href="/builder"
                aria-label={`Use this template: ${t.name}`}
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
                Use this template <span aria-hidden="true">↗</span>
              </Link>
              <p>{t.description}</p>
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
