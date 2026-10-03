import Link from "../../components/SiteLink";
import { pageMetadata } from "../../config/site";
export const metadata = pageMetadata(
  "Privacy Policy",
  "How CV Builder handles browser drafts, local storage, PDF downloads and optional third-party services.",
  "/privacy",
);
export default function Privacy() {
  return (
    <main className="content-page">
      <h1>Privacy Policy</h1>
      <p>
        Policy updated: <time dateTime="2026-10-03">3 October 2026</time>
      </p>
      <h2>Resume information</h2>
      <p>
        You choose the personal and career information you enter. Resume
        editing, preview and PDF generation happen in your browser. The
        application does not send resume fields to a backend, analytics service
        or advertising API. Do not enter information you do not want stored on
        this device.
      </p>
      <h2>Local storage and retention</h2>
      <p>
        The editable draft is stored under <code>resume-builder-data</code> in
        LocalStorage for this browser and origin. It remains until browser data
        is cleared or replaced by your edits. There is no account or server
        draft to recover it from. Download your PDF before clearing site
        storage; a PDF is a rendered copy, not an editable backup. LocalStorage
        is not a promise of encrypted storage. Other people who use your browser
        profile may access the draft.
      </p>
      <h2>Cookies and optional services</h2>
      <p>
        The resume editor uses LocalStorage rather than an account cookie.
        Optional advertising is disabled without a valid publisher configuration
        and an explicit advertising consent signal from a connected consent
        platform. Advertising scripts are not loaded directly on Builder or
        Templates pages. There is no analytics runtime in this release.
      </p>
      <p>
        If Google AdSense is configured and consent permits it, Google may
        process device identifiers, cookies and network information on
        informational pages. Consult{" "}
        <a
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google’s advertising privacy information
        </a>
        . The site owner must configure an appropriate consent platform before
        activation. This page does not certify compliance with every
        jurisdiction.
      </p>
      <h2>Hosting and external links</h2>
      <p>
        Your browser requests the site’s files from its host. Hosting or proxy
        systems may maintain request logs such as IP addresses and request
        times; retention depends on the operator’s settings and is not
        controlled by the browser editor. External links take you to services
        with their own privacy policies.
      </p>
      <h2>Affiliate recommendations</h2>
      <p>
        Optional service recommendations may appear after PDF export if
        configured. Applicable links are disclosed as affiliate links. They do
        not receive your resume from this application; the destination may
        receive normal link-request information when you visit it.
      </p>
      <h2>Your choices</h2>
      <p>
        You can use the builder without optional advertising consent, remove the
        local draft through your browser’s site-data settings, and avoid
        external links. For a shared device, close the site and clear the draft
        after saving the copy you need.
      </p>
      <h2>Children and sensitive information</h2>
      <p>
        The tool is intended for people preparing job or education applications.
        Avoid entering unnecessary sensitive details or information about
        children. The site does not intentionally ask for children’s
        information.
      </p>
      <h2>Changes and contact</h2>
      <p>
        We may update this policy as the application changes. Meaningful changes
        will be reflected in the date above. See{" "}
        <Link href="/contact">Contact</Link> for the currently configured
        contact channel.
      </p>
    </main>
  );
}
