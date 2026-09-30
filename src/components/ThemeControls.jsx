"use client";
import { TEMPLATES, FONTS } from "../data/resume";
import { useResume } from "../context/ResumeContext";
export default function ThemeControls() {
  const { data, setData } = useResume();
  const change = (key, value) =>
    setData((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
  return (
    <div className="theme-controls">
      <div>
        <label htmlFor="template">Template</label>
        <select
          id="template"
          value={data.settings.template}
          onChange={(e) => change("template", e.target.value)}
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="font">Font family</label>
        <select
          id="font"
          value={data.settings.fontFamily}
          onChange={(e) => change("fontFamily", e.target.value)}
        >
          {Object.keys(FONTS).map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="color">Primary color</label>
        <input
          id="color"
          type="color"
          value={data.settings.primaryColor}
          onChange={(e) => change("primaryColor", e.target.value)}
        />
      </div>
      {data.settings.template === "ats" && (
        <p className="help">
          ATS Professional uses a black and gray palette. Your color is retained
          for other templates.
        </p>
      )}
    </div>
  );
}
