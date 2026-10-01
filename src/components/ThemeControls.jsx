"use client";
import { TEMPLATES, FONTS, FONT_STYLES, COLORS } from "../data/resume";
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
        <label htmlFor="font-style">Font style</label>
        <select
          id="font-style"
          value={data.settings.fontStyle || "normal"}
          onChange={(e) => change("fontStyle", e.target.value)}
        >
          {Object.entries(FONT_STYLES).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="color-options">
        <legend>Primary color</legend>
        <div className="color-swatches">
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              className="color-swatch"
              style={{ backgroundColor: color.value }}
              aria-label={`Use ${color.name} color`}
              aria-pressed={
                data.settings.primaryColor.toLowerCase() === color.value
              }
              title={color.name}
              onClick={() => change("primaryColor", color.value)}
            />
          ))}
          <label className="custom-color" htmlFor="color">
            Custom color
            <input
              id="color"
              type="color"
              value={data.settings.primaryColor}
              onChange={(e) => change("primaryColor", e.target.value)}
            />
          </label>
        </div>
      </fieldset>
      {data.settings.template === "ats" && (
        <p className="help">
          ATS Professional uses a black and gray palette. Your color is retained
          for other templates.
        </p>
      )}
    </div>
  );
}
