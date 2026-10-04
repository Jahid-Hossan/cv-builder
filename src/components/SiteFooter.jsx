import PrivacySettings from "./PrivacySettings";
import Link from "./SiteLink";
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>CV Builder · Your resume, on your device.</p>
      <nav aria-label="Footer navigation">
        {[
          ["/about", "About"],
          ["/blog", "Resources"],
          ["/privacy", "Privacy Policy"],
          ["/contact", "Contact"],
          ["/terms", "Terms & Disclaimer"],
        ].map(([url, label]) => (
          <Link key={url} href={url}>
            {label}
          </Link>
        ))}
      <PrivacySettings />
      </nav>
    </footer>
  );
}
