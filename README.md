# Resume Builder

A guest-only, privacy-first resume builder built with **Next.js 15, React 19, JavaScript and Tailwind CSS**. Resume editing, preview, persistence and exports execute in the browser. There are no API routes, database, accounts or external resume services.

## Run locally

Requires Node.js 20.9 or later.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. For a production static build:

```sh
npm test
npm run build
```

Publish the generated `out/` folder using any static host. Configure the host to serve `/builder.html` at `/builder` and `/templates.html` at `/templates` (most static hosts support clean URLs). Do not use `next start`: this project intentionally uses `output: "export"`.

## Features

- Routes: `/`, `/builder`, `/templates`.
- 15 distinct layouts: ATS Professional, Modern, Executive, Creative, Minimal, Classic, Elegant, Compact, Academic, Technical, Timeline, Bold, Nordic, Portfolio and Editorial.
- Personal information, experience, education, skill categories, projects and certifications.
- Live preview, persistent template/color/font customization and responsive editing.
- Section reordering with dnd-kit: drag a handle or focus it, press Space, use arrows and press Space again. Escape cancels.
- Local autosave under `resume-builder-data`; JSON import/export controls have been removed at the user’s request.
- Client-side A4 PDF capture with html2canvas and jsPDF, 10mm outer margins and automatic page splitting.

## Data and privacy

The existing version-1 data model remains compatible. Existing resumes keep their content, original template choices and font settings. New font style choices use an optional `settings.fontStyle` field, defaulting to normal when absent. There are 12 color presets plus a custom picker, 10 font families, and Normal/Bold/Italic/Bold italic styles. Inter, Lato, Roboto, Montserrat, Merriweather, Source Sans 3 and Nunito are bundled locally; Arial, Georgia and Helvetica use system fonts. PDF export checks personal information first.

Autosave debounces writes by 200ms and flushes on page exit. A corrupted saved record is retained rather than silently overwritten; the editor remains usable in memory and PDF export remains available. If storage is unavailable, keep the page open until you download the PDF. LocalStorage belongs to the current browser and origin: a different browser, host or cleared browser data will not contain the same resume. Download your PDF before clearing browser data.

## Architecture

- `src/app/`: static route shells, layout and styles.
- `src/components/`: editor, 15-template preview, theme controls, ordering, gallery and error boundary.
- `src/context/ResumeContext.jsx`: client state and guarded persistence.
- `src/data/resume.js`: version-1 defaults, fields, template/font catalogs.
- `src/utils/`: validation, internal storage serialization, ordering and PDF capture.
- `tests/resume.test.js`: lightweight Node built-in tests; no large test framework.

## PDF considerations

The required html2canvas pipeline produces **image-based PDFs**. ATS Professional is visually simple, but the exported PDF does not contain searchable/selectable text or accessibility tags. ATS parsing compatibility is therefore not guaranteed. Page splitting seeks low-ink rows near page boundaries, but a long entry can span pages. Extreme document lengths can exceed browser canvas or memory limits. These tradeoffs are documented in `COMPLETION_REPORT.md`.

## Dependency choice

Next.js stays on the required 15.x release. The npm `postcss` override uses the project's patched direct PostCSS version for transitive dependencies too. The production build and dependency audit were rerun after this change.

See `COMPLETION_REPORT.md` for actual verification results and remaining risks.

## SEO and monetization setup

See [docs/monetization-and-seo.md](docs/monetization-and-seo.md) for production configuration, consent prerequisites, articles and deployment steps. Optional advertising and affiliate features remain disabled without owner configuration.
