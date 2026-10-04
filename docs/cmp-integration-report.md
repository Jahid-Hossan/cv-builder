# Google CMP integration evidence

The official Google Privacy & messaging callback queue and TCF API replace the custom bridge. JavaScript only; no backend, data schema or resume export changes. AdSense initialization is paused before hydration; callbacks are registered before script insertion. Non-EU eligibility uses the explicit TCF region signal, not timeout or language guesses. This does not add Google Analytics or claim Google Consent Mode is a replacement for TCF.

## Validation

- 17 Node tests passed, including errors, unknown region, rejected consent, stored consent, withdrawal, non-EU signal, publisher restrictions, and excluded routes.
- Production static build passed with real public publisher/contact configuration.
- Automated Chromium tests with mocked Google API and intercepted synthetic ad-request endpoint: all six requested code paths succeeded. Exact results: `cmp-browser-results.json`.
- Builder editing, live preview, template/font/color changes, LocalStorage refresh persistence and PDF download succeeded. No page errors observed.
- Real EU-IP banner, Google ad fill, non-EU-IP serving, and live rejection/withdrawal network capture: NOT VERIFIED. The execution environment returns a Site Unavailable response for the production origin. No real banner screenshot is available; no simulated banner is presented as real evidence.

## Required production follow-up

Use an EU/UK/Swiss connection and a non-EU connection. Confirm AdSense's published message covers cvbuilder.appshub.app. A published parent-domain message is not proof of subdomain coverage. Google's preview query `?fc=alwaysshow&fctype=gdpr` can help inspect a published message but does not establish IP-based targeting. Record accept/reject/reopen/withdrawal in DevTools with Preserve log enabled. CMP and loader requests before consent are expected; ad requests are not. Do not click your own ads. No ad fill is guaranteed by a successful code deployment or consent grant.

A footer withdrawal first pauses, then reopens Google's message. Existing/in-flight requests cannot be recalled. Once refusal is confirmed, reload unloads old scripts/iframes. Protected editor routes use the existing full-document links and never insert the ad tag. These application components never read the local resume or transmit its fields; third-party scripts are still third-party code on the informational-page origin.

## Sources

- https://developers.google.com/funding-choices/fc-api-docs
- https://support.google.com/adsense/answer/7670312?hl=en
- https://support.google.com/adsense/answer/9804260?hl=en
