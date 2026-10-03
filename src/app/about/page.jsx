import Link from "../../components/SiteLink";
import { pageMetadata } from "../../config/site";
export const metadata = pageMetadata(
  "About CV Builder",
  "Learn how CV Builder helps you edit, customize and download a resume privately in your browser.",
  "/about",
);
export default function About() {
  return (
    <main className="content-page">
      <p className="eyebrow">ABOUT THE TOOL</p>
      <h1>A clearer way to present your experience.</h1>
      <p>
        CV Builder is a guest-only resume editor for students, career changers
        and experienced professionals who want control over their document
        without creating an account.
      </p>
      <h2>What you can make</h2>
      <p>
        Add personal details, a summary, experience, education, skills, projects
        and certifications. Choose from 15 templates, reorder sections, and
        adjust fonts and colors while watching a live preview. Download a PDF
        when your draft is ready.
      </p>
      <h2>How it works</h2>
      <p>
        Resume editing and PDF generation run in your browser. Your draft is
        saved in this browser’s LocalStorage; it is not uploaded to a resume
        server. You can return using the same browser and site address. Clearing
        browser data removes the editable draft.
      </p>
      <h2>Know the export format</h2>
      <p>
        PDFs are image-based. They preserve the visual layout, but do not
        contain selectable text. A visually simple template does not guarantee
        that an employer’s applicant tracking system can read the PDF. Follow
        the employer’s upload instructions.
      </p>
      <h2>Start with your own evidence</h2>
      <p>
        The tool formats what you write. It does not generate achievements,
        verify qualifications or guarantee interviews. Use accurate details and
        proofread the downloaded document.
      </p>
      <p>
        <Link href="/builder">Build your resume</Link>,{" "}
        <Link href="/templates">browse templates</Link>, or read our{" "}
        <Link href="/blog">resume resources</Link>.
      </p>
    </main>
  );
}
