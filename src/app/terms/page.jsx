import Link from "../../components/SiteLink";
import { pageMetadata } from "../../config/site";
export const metadata = pageMetadata(
  "Terms & Disclaimer",
  "Understand your responsibilities, resume export limitations and third-party links when using CV Builder.",
  "/terms",
);
export default function Terms() {
  return (
    <main className="content-page">
      <h1>Terms & Disclaimer</h1>
      <p>
        Updated: <time dateTime="2026-10-03">3 October 2026</time>
      </p>
      <h2>Your content</h2>
      <p>
        You remain responsible for the accuracy, permissions and suitability of
        the information you enter. Only include information you are entitled to
        use. Your resume content remains yours; using the editor does not
        transfer ownership to the site.
      </p>
      <h2>Informational guidance</h2>
      <p>
        Resources provide general writing guidance. They are not professional
        legal advice, recruitment services or a guarantee of employment,
        interviews or acceptance by an applicant tracking system. Employer
        instructions take priority over general examples.
      </p>
      <h2>Review your PDF</h2>
      <p>
        Check the exported PDF before applying, including page breaks, text,
        dates, links and readability. Exports are image-based and may not be
        suitable where selectable text or a different file format is required.
      </p>
      <h2>Availability and storage</h2>
      <p>
        Features may change or become unavailable. Browser storage can be
        cleared or fail. Keep a downloaded copy of documents you need; the site
        does not provide cloud recovery.
      </p>
      <h2>Third-party services</h2>
      <p>
        External websites operate under their own terms. An optional
        recommendation does not guarantee the quality of a service. Affiliate
        relationships, where enabled, are disclosed near the link; the site may
        receive a commission at no additional cost to you.
      </p>
      <h2>Site materials and changes</h2>
      <p>
        Do not misrepresent site resources as your own professional
        qualifications or use the service to deceive others. These terms may be
        revised as functionality changes. Read the{" "}
        <Link href="/privacy">Privacy Policy</Link> and visit{" "}
        <Link href="/contact">Contact</Link> for the available communication
        channel.
      </p>
    </main>
  );
}
