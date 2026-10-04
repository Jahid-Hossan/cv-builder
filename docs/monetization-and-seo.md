# Monetization and SEO setup

## Production domain and architecture

The only canonical origin is `https://cvbuilder.appshub.app`. `src/config/site.js` centralizes configuration and metadata. Next.js 15 static export is retained. Public content is statically rendered; resumes stay in browser LocalStorage under the unchanged version-1 schema. This update does not activate advertising or analytics by default and does not guarantee AdSense approval or search indexing.

## AdSense and consent

Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` to your actual `ca-pub-` ID with 16 digits at **build time**, then rebuild. Blank, malformed and all-zero IDs are rejected. A valid configuration adds the global `google-adsense-account` verification meta tag. Optional asynchronous script integration exists once in `OptionalAdvertising.jsx`; no ad slots or auto-ad settings are enabled by this code.

Google Privacy & messaging (formerly Funding Choices) now replaces the custom consent bridge. The owner reports the message published in AdSense; ensure the message covers the exact hostname `cvbuilder.appshub.app`. A root-domain configuration alone is not evidence that the subdomain displays it.

The production-origin AdSense loader requires a valid publisher ID. `layout.jsx` initializes `pauseAdRequests=1` before hydration, and `OptionalAdvertising.jsx` sets up official `googlefc.callbackQueue` and TCF `addEventListener` callbacks before inserting the tag. The tag must load to bootstrap Google's message, but ad requests stay paused until an eligible decision. CMP/loader requests still occur before consent.

For EEA/UK/Swiss visitors, the conservative gate requires Google vendor 755 consent for purposes 1, 3, 4 and a permitted legal basis for purposes 2, 7, 9, 10, respecting publisher restrictions. Partial choices that do not satisfy this gate show no ads. Rejection, unknown geography, CMP errors and open message states remain paused. A settled explicit `gdprApplies=false` signal permits requests outside this region. This is TCF request control, not an Analytics/Google Ads Consent Mode implementation; no analytics is added. Google still evaluates applicable consent signals for its own serving.

The footer's privacy settings button appears only when Google's revocation API is available. It pauses requests immediately and reopens the message through the official callback queue. A settled withdrawal after ads were allowed reloads the document to unload existing ad code. Previously sent requests cannot be recalled. Consent persistence is managed by the CMP; no resume data is read or passed by these components.

See `docs/cmp-integration-report.md` for test limitations. Do not treat mocked API tests as live certification.

The script is excluded from `/builder` and `/templates`. `SiteLink` uses full-document navigation to those routes so scripts from informational pages are discarded before saved resume content is rendered. Preserve that behavior when adding links. Never pass resume fields, form values, user URLs or document contents to advertising. Optional third-party scripts run on the site origin when enabled and need privacy/security review; exclusion from the editor is not a sandbox. Recheck Google Auto ads settings to ensure they do not cover controls or appear in a resume. No advertising belongs inside the preview or PDF.

## ads.txt

`src/app/ads.txt/route.js` generates `/ads.txt` as static plain text. With no publisher ID it contains a comment with the unmistakable `pub-XXXXXXXXXXXXXXXX` placeholder, **not an active fake seller record**. When a valid ID is set, the same configuration generates:

```text
google.com, pub-YOUR_REAL_16_DIGIT_ID, DIRECT, f08c47fec0942fa0
```

This example is documentation only. Verify https://cvbuilder.appshub.app/ads.txt after redeployment. AdSense setup remains incomplete without the real account and required approval/consent configuration.

## Owner handoff insertion points quick reference

| # | Item | Exact File Path | Line Number(s) | Variable / Placeholder Name | Verification & Operational Behavior |
|---|------|-----------------|----------------|-----------------------------|---------------------------------------|
| 1 | AdSense Publisher ID | `src/config/site.js`<br>`.env.example`<br>`src/components/OptionalAdvertising.jsx`<br>`src/app/layout.jsx` | `site.js`: L7<br>`.env.example`: L2<br>`OptionalAdvertising.jsx`: L24-35<br>`layout.jsx`: L16-18 | `adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID \|\| ""` | Validated strictly against `/^ca-pub-\d{16}$/` (all-zeros rejected). Only loads if matching valid ID format, canonical origin `https://cvbuilder.appshub.app`, with ad requests paused pending an official TCF decision. Excluded from `/builder` and `/templates`. Injected once via Next.js `<Script id="cv-builder-adsense" ...>` which guarantees it does not load twice across client navigations. |
| 2 | ads.txt Publisher ID Placeholder | `src/app/ads.txt/route.js` | L4-9 | Placeholder comment: `# AdSense is not configured. Replace pub-XXXXXXXXXXXXXXXX with your real publisher ID via NEXT_PUBLIC_ADSENSE_CLIENT_ID and rebuild.\n` | Generated as static plain text with `Content-Type: text/plain; charset=utf-8`. When `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set to a valid ID, generates `google.com, pub-YOUR_ID, DIRECT, f08c47fec0942fa0`. |
| 3 | Contact Email Configuration | `src/config/site.js`<br>`.env.example`<br>`src/app/contact/page.jsx` | `site.js`: L6<br>`.env.example`: L3<br>`page.jsx`: L16-28 | `contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL \|\| ""` | Current value is **NOT** a fake placeholder email; it defaults to empty string `""`. When unset, `/contact` honestly displays: *"A direct contact address has not yet been published. This page does not collect messages."* (no fake form or sample address). The owner must supply a real valid RFC 5322 email. |
| 4 | Affiliate Config File | `src/config/site.js`<br>`.env.example`<br>`src/components/AffiliateOffer.jsx`<br>`src/components/Builder.jsx` | `site.js`: L8-14<br>`.env.example`: L4-6<br>`AffiliateOffer.jsx`: L1-18<br>`Builder.jsx`: L64 | `affiliate: { enabled, name, url, disclosure }` | Currently `enabled: false`. Outbound link uses `target="_blank"` and `rel="noopener noreferrer sponsored"`. Mandates visible disclosure: *"Some links may be affiliate links. We may earn a commission at no additional cost to you."* Rendered only after PDF export succeeds, completely outside `paperRef` (does not appear in generated PDF) and in document flow (does not cover form controls or resume preview). |
| 5 | Search Console DNS TXT Record | Vercel DNS Dashboard | Vercel DNS Records settings | `google-site-verification=...` (TXT record at host `@`) | See step-by-step Vercel DNS instructions below. |
| 6 | Analytics Measurement ID | `.env.example` | L8 | `NEXT_PUBLIC_GA_MEASUREMENT_ID=` | **NOT SUPPORTED / NO RUNTIME ACTIVE**. Documented as a reserved build variable placeholder only. No runtime code loads Google Analytics or gtag. |

## Search Console DNS TXT record instructions for appshub.app on Vercel

If authoritative DNS for `appshub.app` is managed via Vercel:
1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add property**, select the **Domain** property type, and enter `appshub.app` (covers root and all subdomains including `cvbuilder.appshub.app`).
3. Google will present a DNS TXT verification token formatted as: `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`. Copy this entire string.
4. Log in to the [Vercel Dashboard](https://vercel.com) and navigate to the project/team that manages the `appshub.app` domain.
5. Go to **Settings** > **Domains**, locate `appshub.app`, and click **Manage** > **DNS Records**.
6. Click **Add Record**:
   - **Type**: `TXT`
   - **Name**: `@` (or leave blank for root domain)
   - **Value**: `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - **TTL**: `60` seconds (default)
7. Click **Add** / **Save**.
8. Verify DNS propagation using `nslookup -type=TXT appshub.app` or `dig TXT appshub.app` until the verification record is returned by public resolvers.
9. Return to Google Search Console and click **Verify**.
10. Once verified, submit the sitemap URL: `https://cvbuilder.appshub.app/sitemap.xml`.

## Published blog articles (15 total)

All 15 articles are published, included in `src/data/articles.js`, indexed in `/sitemap.xml`, and statically rendered to `out/blog/[slug].html` with initial server-rendered HTML, unique metadata, and semantic H1 -> H2 -> H3 hierarchy:

1. `achievement-based-resume-bullets` — *How to Write Achievement-Based Resume Bullet Points* (1,170 words)
2. `resume-format-guide` — *2026 Resume Format Guide: Choose a Layout for Your Evidence* (1,284 words)
3. `resume-checklist` — *Resume Checklist Before Applying for a Job* (1,214 words)
4. `ats-resume-guide` — *How to Write a Resume That Gets Past ATS Systems* (1,044 words)
5. `resume-formats-by-industry` — *Best Resume Formats for Different Industries* (913 words)
6. `common-resume-mistakes` — *Common Resume Mistakes to Avoid Before Applying* (880 words)
7. `how-long-should-a-resume-be` — *How Long Should a Resume Be? A Practical Length Guide* (866 words)
8. `resume-vs-cv-difference` — *Resume vs CV: What's the Difference?* (901 words)
9. `how-to-write-resume-summary` — *How to Write a Strong Resume Summary* (903 words)
10. `work-experience-on-resume` — *How to Write Work Experience on a Resume* (878 words)
11. `how-to-list-skills-on-resume` — *How to List Skills on a Resume* (863 words)
12. `resume-with-no-experience` — *How to Write a Resume With No Experience* (865 words)
13. `student-resume-guide` — *How to Make a Student Resume* (846 words)
14. `tailor-resume-job-description` — *How to Tailor Your Resume to a Job Description* (869 words)
15. `best-fonts-for-resume` — *Best Fonts for a Professional Resume* (862 words)

Remaining content backlog topics for future editorial expansion:
- How to Use Keywords in Your Resume
- How to Write Education on a Resume
- How to Explain Employment Gaps on a Resume
- Resume Formatting Mistakes That Hurt Readability

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

Check the real HTTPS origin, `/builder`, `/templates`, `/about`, `/privacy`, `/contact`, `/terms`, `/blog`, all three published `/blog/<slug>` routes, `/ads.txt`, `/sitemap.xml`, `/robots.txt`, `/icon.svg`, and an unknown route (must return 404). Inspect source HTML for canonical and article content. Test editing, persistence, fonts/colors, all templates and PDF downloads on desktop and mobile. Check ad requests are paused before consent and scripts are always absent in fresh Builder/Templates documents. Check CMP grant/withdrawal and real provider behavior only after actual integration.

There is no standalone lint script or lint configuration in the original project. Node tests and production build are the existing checks; do not interpret Next's generic “Linting” build label as a separately configured lint pass.
