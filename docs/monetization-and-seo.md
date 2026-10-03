# Monetization and SEO setup

## Production domain and architecture

The only canonical origin is `https://cvbuilder.appshub.app`. `src/config/site.js` centralizes configuration and metadata. Next.js 15 static export is retained. Public content is statically rendered; resumes stay in browser LocalStorage under the unchanged version-1 schema. This update does not activate advertising or analytics by default and does not guarantee AdSense approval or search indexing.

## AdSense and consent

Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` to your actual `ca-pub-` ID with 16 digits at **build time**, then rebuild. Blank, malformed and all-zero IDs are rejected. A valid configuration adds the global `google-adsense-account` verification meta tag. Optional asynchronous script integration exists once in `OptionalAdvertising.jsx`; no ad slots or auto-ad settings are enabled by this code.

Script loading also requires the real production origin and an explicit advertising-consent signal. There is no CMP or consent banner in this release. Connect and verify an appropriate real CMP before activating ads. Google documents certified CMP requirements for personalized ads in the EEA, UK and Switzerland: https://support.google.com/adsense/answer/13554116?hl=en . A hand-built banner or this bridge does not certify legal compliance.

A CMP adapter can publish an actual resolved choice using:

```js
window.cvBuilderConsent = { advertising: /* actual CMP result */ };
window.dispatchEvent(new Event('cv-builder-consent-change'));
```

Do not substitute an unconditional `true`, derive a choice from a mere visit, or use the bridge as a fake CMP. The CMP must manage renewal, withdrawal, vendor consent and applicable TCF requirements. Google Consent Mode/TCF integration still needs implementation and validation with the chosen CMP; this bridge alone is not Google Consent Mode. Revocation stops future component rendering but does not undo already-executed remote code. The CMP adapter must reload the document on withdrawal and apply its provider-specific revocation handling.

The script is excluded from `/builder` and `/templates`. `SiteLink` uses full-document navigation to those routes so scripts from informational pages are discarded before saved resume content is rendered. Preserve that behavior when adding links. Never pass resume fields, form values, user URLs or document contents to advertising. Optional third-party scripts run on the site origin when enabled and need privacy/security review; exclusion from the editor is not a sandbox. Recheck Google Auto ads settings to ensure they do not cover controls or appear in a resume. No advertising belongs inside the preview or PDF.

## ads.txt

`src/app/ads.txt/route.js` generates `/ads.txt` as static plain text. With no publisher ID it contains a comment with the unmistakable `pub-XXXXXXXXXXXXXXXX` placeholder, **not an active fake seller record**. When a valid ID is set, the same configuration generates:

```text
google.com, pub-YOUR_REAL_16_DIGIT_ID, DIRECT, f08c47fec0942fa0
```

This example is documentation only. Verify https://cvbuilder.appshub.app/ads.txt after redeployment. AdSense setup remains incomplete without the real account and required approval/consent configuration.

## Search Console

1. In Google Search Console add a Domain property for `appshub.app` (covers subdomains), or choose the appropriate verification method for a URL-prefix property at the exact CV Builder origin.
2. Copy the real `google-site-verification=...` TXT value Google provides.
3. Add it to the authoritative DNS provider for `appshub.app`, at the host Google specifies; do not guess a token or replace unrelated TXT records.
4. Check the authoritative DNS response or `nslookup -type=TXT appshub.app`, wait for propagation, then click Verify in Search Console.
5. Submit https://cvbuilder.appshub.app/sitemap.xml for the relevant property. DNS verification and indexing have not been performed by this code change.

## Sitemap and robots

Native static metadata routes expose `/sitemap.xml` and `/robots.txt`. The sitemap contains the eight public page routes and three published articles. Fixed article dates reflect this publication change; generic pages have no fabricated modification date. Robots allows crawling and references the production sitemap. Canonical URLs use HTTPS with no trailing slash. Configure the existing reverse proxy to redirect HTTP to HTTPS; if alternative hostnames exist, redirect them to the canonical origin without chains. Do not globally redirect unknown paths to the homepage.

## Blog and remaining topics

`src/data/articles.js` stores plain strings and structured sections, with no CMS or unsafe HTML rendering. `/blog/[slug]` uses `generateStaticParams` and server/static rendering. Add a unique slug, title, description, actual publication date, introduction, sections and valid related article IDs. Rebuild to publish. Update dates only after meaningful revisions. `formatDate` displays each stored date. No fabricated authors, reviews or credentials are used.

Published cornerstone drafts: achievement-based resume bullets (961 words), 2026 format guide (1050), application checklist (985). Review them editorially before production publication. They explicitly describe the raster PDF limitation rather than guaranteeing ATS success.

Remaining content backlog (not published or included in sitemap):

- How to Write a Resume That Gets Past ATS Systems (careful framing, no guarantee)
- Best Resume Formats for Different Industries
- Common Resume Mistakes to Avoid
- How Long Should a Resume Be?
- Resume vs CV: What's the Difference?
- How to Write a Strong Resume Summary
- How to Write Work Experience on a Resume
- How to List Skills on a Resume
- How to Write a Resume With No Experience
- How to Make a Student Resume
- How to Tailor Your Resume to a Job Description
- Best Fonts for a Professional Resume
- How to Use Keywords in Your Resume
- How to Write Education on a Resume
- How to Explain Employment Gaps on a Resume
- How to Make an ATS-Friendly Resume (include the actual export limitation)
- Resume Formatting Mistakes That Hurt Readability

Avoid overlapping articles merely to reach 20. Useful standalone examples and distinct intent should determine whether a topic warrants another article.

## Affiliate

Disabled by default. Set public build-time variables `NEXT_PUBLIC_AFFILIATE_ENABLED=true`, `NEXT_PUBLIC_AFFILIATE_NAME` (legitimate provider/service name), and `NEXT_PUBLIC_AFFILIATE_URL` (real HTTPS affiliate destination). Empty names, missing disclosures and unsafe URLs suppress the offer. `siteConfig.affiliate.disclosure` supplies the visible disclosure. `AffiliateOffer` appears only after PDF export returns successfully, outside the preview. It does not claim the user has saved the download or upload their resume. External links use `sponsored noopener noreferrer`.

## Analytics

There is no analytics runtime. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is reserved/documented only; setting it does not load Google Analytics. Before implementing GA, connect real consent, disable automatic form measurement and URL/query capture, and allow only non-sensitive events. Never send resume contents. Do not make AdSense readiness depend on analytics.

## Contact

Set the real `NEXT_PUBLIC_CONTACT_EMAIL` at build time. With no valid address, Contact honestly states that no direct address is published and does not show a fake form. Publishing a working contact channel is an outstanding owner action.

## Deployment

No SSH/VPS or deployment credentials were supplied. Do not create a second production site. Use the current deployment workflow and preserve the domain/proxy configuration. Standard static build:

```sh
npm ci
npm test
npm run build
```

Serve `out/` with clean HTML URLs, the correct MIME types and a real 404 status. There is no `next start` server for static export. `deploy/nginx.conf` is a suggested Nginx container config with port **3000 internally** and safe baseline headers. It intentionally limits CSP to `frame-ancestors` to avoid breaking Next scripts, fonts or PDF capture. It is not a complete restrictive CSP.

Optional Docker packaging is provided. Build on your existing host with real public build arguments where applicable, for example `docker build -t cv-builder .`, and update the existing container. Do not publish host port 3000 if another service uses it. On the shared proxy network, point Nginx Proxy Manager to the CV Builder container's DNS name and internal port 3000; different containers can each listen on internal port 3000. For direct host access, select an unused host port. Docker build arguments are embedded at build time; runtime `-e` changes do not update static files. `.env.example` is tracked as a template; `.env` files remain ignored. Never pass secrets as public configuration.

The proxy must apply equivalent security headers if using another static server. Validate Nginx with `nginx -t` in your actual container and check HTTP response headers after deployment. Container build, Nginx execution, HTTPS redirects and production header behavior require environment verification.

## Post-deployment verification

Check the real HTTPS origin, `/builder`, `/templates`, `/about`, `/privacy`, `/contact`, `/terms`, `/blog`, all three published `/blog/<slug>` routes, `/ads.txt`, `/sitemap.xml`, `/robots.txt`, `/icon.svg`, and an unknown route (must return 404). Inspect source HTML for canonical and article content. Test editing, persistence, fonts/colors, all templates and PDF downloads on desktop and mobile. Check optional scripts are absent before consent and always absent in fresh Builder/Templates documents. Check CMP grant/withdrawal and real provider behavior only after actual integration.

There is no standalone lint script or lint configuration in the original project. Node tests and production build are the existing checks; do not interpret Next's generic “Linting” build label as a separately configured lint pass.
