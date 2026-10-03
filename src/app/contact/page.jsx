import { pageMetadata, siteConfig, validEmail } from "../../config/site";
export const metadata = pageMetadata(
  "Contact CV Builder",
  "Find the available contact channel and what to include when reporting a CV Builder problem.",
  "/contact",
);
export default function Contact() {
  return (
    <main className="content-page">
      <h1>Contact</h1>
      <p>
        For a problem with the tool, include the affected page, browser name and
        the steps that led to the issue. Do not send your full resume, personal
        identifiers or private employment details.
      </p>
      {validEmail(siteConfig.contactEmail) ? (
        <p>
          Email:{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>
            {siteConfig.contactEmail}
          </a>
        </p>
      ) : (
        <p>
          A direct contact address has not yet been published. This page does
          not collect messages.
        </p>
      )}
      <h2>Before reporting a PDF issue</h2>
      <p>
        Check that Full Name and Email are valid, wait for fonts to load, and
        try downloading again. Keep the page open if local saving has failed.
        Describe the layout problem without sharing sensitive resume content.
      </p>
      <h2>No message storage</h2>
      <p>
        There is no contact form or message backend on this site. If an email
        link is available, it opens your email application; sending and delivery
        are handled by your email provider.
      </p>
    </main>
  );
}
