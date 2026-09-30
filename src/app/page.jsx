import Link from "next/link";
export default function Home() {
  return (
    <main className="home">
      <div className="hero-copy">
        <p className="eyebrow">A LITTLE CLARITY. A BIG NEXT STEP.</p>
        <h1>
          Your story.
          <br />
          Beautifully <em>presented.</em>
        </h1>
        <p className="hero-description">
          Turn your experience into a resume that feels like you. Thoughtful
          templates, instant previews, and complete control over your personal
          information.
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
          <p>Four distinct templates. One that fits your story.</p>
        </div>
        <div>
          <span>02</span>
          <h2>Make it your own</h2>
          <p>Add your experience. Fine-tune the font and color.</p>
        </div>
        <div>
          <span>03</span>
          <h2>Take the next step</h2>
          <p>Download your PDF and keep a JSON backup.</p>
        </div>
      </section>
    </main>
  );
}
