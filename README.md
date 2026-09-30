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
- Four layouts: ATS Professional, Modern, Executive and Creative.
- Personal information, experience, education, skill categories, projects and certifications.
- Live preview, persistent template/color/font customization and responsive editing.
- Section reordering with dnd-kit: drag a handle or focus it, press Space, use arrows and press Space again. Escape cancels.
- Version-1 JSON import/export and local autosave under `resume-builder-data`.
- Client-side A4 PDF capture with html2canvas and jsPDF, 10mm outer margins and automatic page splitting.

## Data and privacy

The schema matches the requested version-1 data model. Template identifiers are `ats`, `modern`, `executive` and `creative`. Font choices are Inter (bundled locally), Arial, Georgia and Helvetica. No resume content is sent to a server. JSON backups support incomplete drafts; PDF export checks personal information first.

Autosave debounces writes by 200ms and flushes on page exit. A corrupted saved record is retained rather than silently overwritten; import a valid backup to replace it. If storage is unavailable, editing and backup exports remain available in memory. LocalStorage belongs to the current browser and origin: a different browser, host or cleared browser data will not contain the same resume. Keep JSON backups.

## Architecture

- `src/app/`: static route shells, layout and styles.
- `src/components/`: editor, four-template preview, theme controls, ordering, gallery and error boundary.
- `src/context/ResumeContext.jsx`: client state and guarded persistence.
- `src/data/resume.js`: version-1 defaults, fields, template/font catalogs.
- `src/utils/`: validation, backups, ordering and PDF capture.
- `tests/resume.test.js`: lightweight Node built-in tests; no large test framework.

## PDF considerations

The required html2canvas pipeline produces **image-based PDFs**. ATS Professional is visually simple, but the exported PDF does not contain searchable/selectable text or accessibility tags. ATS parsing compatibility is therefore not guaranteed. Page splitting seeks low-ink rows near page boundaries, but a long entry can span pages. Extreme document lengths can exceed browser canvas or memory limits. These tradeoffs are documented in `COMPLETION_REPORT.md`.

## Dependency choice

Next.js stays on the required 15.x release. The npm `postcss` override uses the project's patched direct PostCSS version for transitive dependencies too. The production build and dependency audit were rerun after this change.

See `COMPLETION_REPORT.md` for actual verification results and remaining risks.
