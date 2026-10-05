# Font loading audit — 5 October 2026

## Findings and changes

No fonts.googleapis.com, fonts.gstatic.com, gstatic preconnect, gtag, google-analytics, or G- measurement ID was present in src/ or public/. Fonts already used self-hosted @fontsource Latin subsets and font-display:swap. No Google Analytics script was added or changed.

Removed Lato, Montserrat, Nunito, Roboto, and Source Sans 3 dependencies and CSS imports. The font selector derives its choices from FONTS and now offers only Inter and Merriweather. Regular, bold, italic, and bold italic remain available. Existing version-1 drafts map retired sans-serif/system fonts to Inter and Georgia to Merriweather, preserving all resume content and other settings. The font advice article now reflects the two supported choices.

## Build evidence

- Production build succeeded; 18 Node tests passed, including restoration of every retired font without losing resume fields.
- Homepage: `.next/server/app/index.html` and `out/index.html` are 18,491 bytes, approximately 4.4 KB gzip. RSC inline payload is 12,188 bytes; all inline script bodies total 12,846 bytes. No 247 KB homepage document was reproduced.
- CSS: 37,169 to 32,169 bytes.
- Bundled WOFF/WOFF2 assets: 1,503,336 to 703,024 bytes. These are emitted build assets, not a claim that every page downloads all of them. A clean output directory was used for the final count.
- Source and generated homepage contain zero Google Fonts/gstatic references.
- Browser tests: legacy Lato draft restored as Inter; two selector options; both fonts loaded from local WOFF2 URLs; both generated downloaded PDFs; preview, template/color settings, and LocalStorage persistence worked without page errors. See `font-verification.json`.

## Performance measurements and limits

Local mobile Lighthouse on the production export, served without compression and without production advertising: performance 87, LCP 3,555 ms, transferred bytes 443,674. This is not a production result and does not meet the requested 2.5-second LCP target.

Production PageSpeed report captured before publishing this change at 16:12 Saudi time:
https://pagespeed.web.dev/analysis/https-cvbuilder-appshub-app/varq5018mk?form_factor=mobile

- Performance 59; LCP 5.6 seconds; FCP 2.8 seconds; TBT 470 ms; CLS 0.
- Main HTML transfer: 5.62 KiB. No preconnected origins reported.
- LCP element: homepage H1; element render delay 2,490 ms.
- Third-party work: Google/Doubleclick Ads 233 KiB and 225 ms main-thread time; Funding Choices 105 KiB and 120 ms; Cloudflare beacon 10 KiB and 14 ms.
- Critical chain shown: first-party CSS, Cloudflare email-decode, Cloudflare beacon/RUM. The reported Google Fonts CDN request was not reproduced in this report's critical chain or third-party table. Cache-lifetime findings name ads and Cloudflare resources, not Google Analytics.

These observations do not prove that a Google-owned script can never request a font in another region or consent state. Removing first-party font families does not control third-party script internals. AdSense/CMP behavior and consent gates were not changed by this patch.

Deployment verification now prints homepage HTML byte count and fails if the public HTML contains fonts.googleapis, fonts.gstatic, or gstatic. Deployment requires the already configured workflow's Cloudflare API token and zone ID secrets. A successful deployment and post-change production PageSpeed result must be confirmed separately; the pre-change report above is not an after result.
