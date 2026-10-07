import Link from "../components/SiteLink";
import StructuredData from "../components/StructuredData";
import { siteConfig, pageMetadata } from "../config/site";
export const metadata = pageMetadata(
  "Free Resume Builder — No Sign-Up, Instant PDF",
  "Build a professional resume in your browser. 15 free templates, live preview, custom fonts, instant PDF download. No account needed.",
  "/",
);
export default function Home() {
  return (
    <main className="home">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Resume Builder by Appshub",
          alternateName: ["CV Builder", "Appshub CV Builder"],
          url: siteConfig.url,
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Resume Builder by Appshub",
          alternateName: ["CV Builder", "Appshub CV Builder"],
          url: siteConfig.url,
          description: siteConfig.description,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web browser",
        }}
      />
      <div className="hero-copy">
        <p className="eyebrow">A LITTLE CLARITY. A BIG NEXT STEP.</p>
        <h1>
          Your story.
          <br />
          Beautifully <em>presented.</em>
        </h1>
        <p className="hero-description">
          Turn your experience into a resume that feels like you. A free,
          privacy-first resume builder with no sign-up.
        </p>
        <div className="hero-actions">
          <Link className="primary button-link" href="/builder">
            Build my resume <span aria-hidden="true">↗</span>
          </Link>
          <Link className="text-link" href="/templates">
            Explore templates →
          </Link>
        </div>
        <p className="privacy-line">
          <span aria-hidden="true">◈</span> No accounts. No uploads. Just you
          and your browser.
        </p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-note">A fresh start, on paper.</div>
        <div className="art-paper">
          <div className="art-header">
            <div className="art-monogram">AM</div>
            <div>
              <h2>Alex Morgan</h2>
              <p>PRODUCT DESIGNER</p>
            </div>
          </div>
          <p className="art-contact">London, UK · alex@example.com</p>
          <h3>PROFILE</h3>
          <p>
            Thoughtful design. Meaningful experiences.
            <br />A career built on curiosity and craft.
          </p>
          <h3>EXPERIENCE</h3>
          <div className="art-row">
            <strong>Senior Product Designer</strong>
            <span>2022 — Present</span>
          </div>
          <p>Studio North · London</p>
          <div className="art-line long" />
          <div className="art-line" />
          <h3>EDUCATION</h3>
          <strong>BA, Design & Communication</strong>
          <p>University of the Arts · 2018</p>
          <h3>SKILLS</h3>
          <p>Strategy · Research · Product design</p>
        </div>
        <div className="art-sticker">
          100%
          <br />
          <small>YOURS</small>
        </div>
      </div>
      <section className="home-features" aria-label="How it works">
        <div>
          <span>01</span>
          <h2>Find your format</h2>
          <p>15 distinct templates. Find one that fits your story.</p>
        </div>
        <div>
          <span>02</span>
          <h2>Make it your own</h2>
          <p>Add your experience. Fine-tune the font and color.</p>
        </div>
        <div>
          <span>03</span>
          <h2>Take the next step</h2>
          <p>Download your PDF and take your next step.</p>
        </div>
      </section>
      <section className="home-resources" aria-labelledby="resources-title">
        <h2 id="resources-title">Before you apply</h2>
        <p>
          Choose a format that fits your evidence, write accurate experience
          descriptions and review your downloaded PDF.
        </p>
        <Link href="/blog">Read the resume guides →</Link>
        <p className="help">
          PDFs are image-based. Follow your employer’s file requirements; ATS
          parsing is not guaranteed.
        </p>
      </section>
    </main>
  );
}
