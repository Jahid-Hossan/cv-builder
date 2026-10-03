# SEO and monetization update — evidence report

## 1. Repository audit

Baseline: clean working tree at `ecfbba61288c3e6f4764fb61103398d25f97247e`. Next.js 15.5.27 App Router, React 19, JavaScript, Tailwind, npm lockfile, static export. Three routes, 15 templates, font/color styles, browser LocalStorage version 1, live preview, dnd-kit ordering, lazy raster PDF pipeline and Error Boundary existed. No trust pages, blog, canonical/Open Graph URLs, sitemap, robots, ads.txt, site icon, contact channel, CMP, advertising or analytics existed. No PWA/service worker, database or authentication existed. No standalone lint script/configuration existed. No deployment workflow or Docker configuration was present in the inspected repository. Baseline `npm ci`, 9 tests and production build passed.

## 2. Architecture decisions

Kept static export and the data schema unchanged. Native metadata routes generate sitemap/robots; a force-static route generates ads.txt at build time, requiring no production backend. Server-rendered structured content objects provide the blog. No dependency was added or upgraded. Configuration is centralized in `src/config/site.js`. Optional advertising requires a valid owner ID, production origin and real consent signal; editor and template routes are excluded. Full-document links into those routes discard scripts before a saved resume is shown. Affiliate recommendations sit outside the PDF subtree after export succeeds. Analytics is documentation/configuration readiness only.

## 3. Files changed

Added: `src/config/site.js`; `src/data/articles.js`; About, Privacy, Contact, Terms, Blog listing and static article route; sitemap, robots, ads.txt and not-found files; `SiteFooter`, `SiteLink`, `StructuredData`, `OptionalAdvertising`, `AffiliateOffer`; `public/icon.svg`; `tests/site.test.js`; `.env.example`; `Dockerfile`, `.dockerignore`, `deploy/nginx.conf`; setup/report/verification documentation.

Modified: root layout, homepage, Builder/Templates metadata, Builder's post-export offer, global CSS, README and `.gitignore`. Editor, resume schema, preview renderer, templates, PDF algorithm and persistence implementation were preserved.

## 4. AdSense

Valid public publisher configuration adds one global verification meta tag. A single asynchronous Next Script integration is consent-gated and disabled by default. Fake/blank/all-zero values do not activate it. No ad slots were inserted. Real credentials, account approval, auto-ad settings and real provider behavior: **NOT VERIFIED**. No real publisher ID was supplied.

## 5. ads.txt

Local static response is plain text with an unmistakable commented placeholder and no fake seller record. A valid publisher ID generates the correct seller syntax from the same configuration. Production response and real seller registration: **NOT VERIFIED**.

## 6. Search Console

Documented Domain-property TXT verification at authoritative DNS and sitemap submission. Real token, DNS changes, verification and indexing: **NOT VERIFIED**; owner must perform them.

## 7. Sitemap and robots

Verified local endpoints `/sitemap.xml` and `/robots.txt`. Exactly 11 canonical public URLs on the specified HTTPS origin. No development hostname, no global crawl block, no invented page update dates. Article dates are fixed at this content publication change.

## 8. Trust pages

About, Privacy, Contact and Terms/Disclaimer exist with unique metadata and global footer links. Privacy describes actual browser storage, raster downloads, optional scripts, hosting uncertainty and external links. No fabricated entity, address, biography, authority or contact form. Missing real contact email remains an owner action.

## 9. Blog

Three distinct static guides: achievement-based resume bullets (961 words), 2026 resume formats (1050), and application checklist (985). Bodies are present in initial HTML, with dates, headings, related links and Article/Breadcrumb JSON-LD. Seventeen remaining requested topics are recorded as unpublished backlog in the setup guide. No invented author, quotations or statistics. Editorial review checked practical examples, factual framing and truthful PDF limitations; independent recruiter/subject expert review was not performed.

## 10. SEO

Unique titles/descriptions, canonical/Open Graph URLs and internal links verified for all 11 public page routes. Home WebSite/WebApplication and article JSON-LD parsed successfully. A working SVG icon is referenced; no missing OG image is advertised. Important pages are not noindexed. Search-engine acceptance, rich results and actual indexing are not guaranteed or verified.

## 11. Affiliate

Disabled by default. Configurable provider name, HTTPS URL and visible disclosure; invalid/empty configuration suppresses the offer. Secure sponsored external-link attributes. Default absence after PDF export verified. Real enabled affiliate destination/conversion: **NOT VERIFIED**.

## 12. Privacy and consent

Resume version-1 LocalStorage and browser PDF processing retained. No application code transmits resume fields to advertising or analytics. No optional third-party requests occurred in default browser QA. No fake consent banner or assumed opt-in exists. A real CMP, Google Consent Mode/TCF integration, consent renewal/withdrawal and legal review remain outstanding before advertising activation. Third-party scripts, if enabled on informational pages, are not sandboxed; privacy exclusion from the editor is not a claim of total isolation.

## 13. Accessibility

Current axe WCAG A/AA scans reported zero violations across all 11 public routes in tested states. Builder/Gallery scans also passed in the separate template suite. Navigation, headings, semantic links, focus styles and mobile tabs reviewed. New content and footer preserve visible link styling. Manual screen-reader certification and real-device testing: **NOT VERIFIED**.

## 14. Security

Reviewed changed code for unsafe HTML, protocols, public secrets and external links. Articles render escaped React strings. JSON-LD escapes `<`; configuration validates publisher IDs, contact emails and affiliate protocols. No secrets added. Optional Nginx headers include nosniff, referrer policy, permissions policy and CSP frame-ancestors without breaking capture/scripts. `npm audit --omit=dev` reported zero production vulnerabilities. Docker/Nginx execution and production header behavior: **NOT VERIFIED**, tooling/deployment access unavailable. No broad security certification is claimed.

## 15. Performance

Static article/trust content, no new dependency, no image bloat, lazy PDF libraries retained, nonblocking optional advertising. Measured mobile Lighthouse results are in `docs/seo-performance-verification.json`. Templates scored 86 in the preloading-free run, below the original >90 target; font preloading did not improve it and was removed. This remains a limitation for follow-up gallery rendering/font analysis rather than a passing performance claim. Accessibility scored 100 on the measured routes. Builder cumulative layout shift measured 0.163 during initial restoration, above the 0.1 good threshold; it is another performance follow-up. Scores are local samples, not production guarantees.

## 16. CV Builder regression QA

Verified personal editing, live preview, all section add/edit/delete, restoration after refresh, preserved legacy content, all 15 templates, 10 font families, color/style persistence, mobile Edit/Preview and downloadable PDFs from all 15 templates. Generated regression PDF metadata is portrait A4. Content remained intact after PDF export. JSON UI stayed removed. The PDF algorithm remains image-based, with existing canvas/memory and pagination limitations. Current long multipage capture and pointer/keyboard reorder browser flows were not rerun; original historical checks and current ordering unit tests remain available.

## 17. Tests

- `npm ci`: PASS, baseline clean install.
- `npm test`: PASS, 12/12 tests after implementation.
- `npm run build`: PASS, production static export.
- `git diff --check`: PASS.
- `npm audit --omit=dev --json`: PASS, zero reported production vulnerabilities.
- Temporary Chromium/Playwright route suite: 21 recorded checks passed; template/builder suite: 33 recorded checks passed. No browser framework was added to the project's dependencies.
- `npm run lint`: NOT RUN, no script/configuration exists. Do not interpret Next's generic build label as a separately configured lint pass.

Results: `docs/seo-route-verification.json`, `docs/seo-builder-verification.json`. These are current checks; earlier completion reports are historical evidence.

## 18. Routes verified locally

`/`, `/builder`, `/templates`, `/about`, `/privacy`, `/contact`, `/terms`, `/blog`, `/blog/achievement-based-resume-bullets`, `/blog/resume-format-guide`, `/blog/resume-checklist`, `/ads.txt`, `/sitemap.xml`, `/robots.txt`, `/icon.svg`, and `/no-such-page` (404). HTML, metadata, JSON-LD, response content and default inactive optional features were inspected. Public page routes passed overflow checks at 375/430/768/1024/1440px. Mobile blog screenshot inspected.

## 19. Production verification

**NOT VERIFIED.** Attempted HTTPS access to `https://cvbuilder.appshub.app` returned a “Site Unavailable / Unable to access this site” document from this environment. The nominal HTTP 200 does not prove the CV Builder is served. No deployment or DNS changes were made. No SSH/VPS or deployment credentials were supplied. Use the existing hosting workflow, apply the optional static-server configuration as appropriate, then verify the real domain and routes.

## 20. Remaining owner actions

Provide real AdSense ID and configure approval/consent; select and integrate real CMP with actual consent and withdrawal; publish a working contact address; add Search Console TXT and submit sitemap; optionally configure a legitimate affiliate offer; review/publish remaining content; redeploy the existing site and run production checks. Analytics integration needs separate consent-aware implementation if desired; reserved GA variable alone does nothing. Address the Templates performance limitation and retain truthful raster-PDF/ATS messaging.

## 21. Git

Feature branch: `feature/adsense-seo-blog-readiness`. This report is committed with implementation/evidence. The final response supplies the actual commit and PR URL after successful publication. No main-branch merge, force push or deployment is performed by this feature-branch update.
