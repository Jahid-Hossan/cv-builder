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
        Policy updated: <time dateTime="2026-10-04">4 October 2026</time>
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
      <h2>Cookies and Google consent management</h2>
      <p>
        We use Google's certified Consent Management Platform, Google Privacy
        &amp; messaging (formerly Funding Choices), integrated with the IAB
        Transparency and Consent Framework. It collects advertising choices
        for visitors in the EEA, UK and Switzerland. Ad requests start paused
        and remain paused until the required consent is confirmed. Refusing
        advertising consent keeps ads disabled. Visitors whom the CMP identifies
        as outside this region may receive ads subject to Google's applicable controls.
      </p>
      <p>
        Use “Privacy and cookie settings” in the footer, where the CMP is
        available, to reopen the message and withdraw consent. Requests pause
        when you open settings. After withdrawal, the page reloads to unload
        existing ad scripts. Requests already sent cannot be recalled.
        This control is on informational pages; Builder and Templates do not
        load advertising scripts. Return to the home page to manage your choice.
      </p>
      <p>
        Google scripts load to deliver the consent message even before your
        decision. Google may receive network information, and the CMP stores
        your choices. With advertising permitted, Google may use cookies and
        device identifiers. We do not pass resume fields or the local draft to
        these APIs. There is no analytics runtime. Read{' '}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
          Google's advertising privacy information
        </a>.
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
