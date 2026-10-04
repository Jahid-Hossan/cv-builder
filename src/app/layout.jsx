import Link from "../components/SiteLink";
import "./globals.css";
import { ResumeProvider } from "../context/ResumeContext";
import ErrorBoundary from "../components/ErrorBoundary";
import { siteConfig, pageMetadata, validAdsenseId } from "../config/site";
import SiteFooter from "../components/SiteFooter";
import OptionalAdvertising from "../components/OptionalAdvertising";
export const metadata = {
  metadataBase: new URL(siteConfig.url),
  ...pageMetadata(
    "Free CV Builder | Create a Resume in Your Browser",
    siteConfig.description,
    "/",
  ),
  icons: { icon: "/icon.svg" },
  ...(validAdsenseId(siteConfig.adsenseClientId)
    ? { other: { "google-adsense-account": siteConfig.adsenseClientId } }
    : {}),
};
export const viewport = { themeColor: "#205c4c" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Pause before hydration or any AdSense insertion. This loads no remote code. */}
        <script dangerouslySetInnerHTML={{ __html: "(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;" }} />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Resume Builder home">
            <span className="brand-icon" aria-hidden="true">
              R
            </span>
            Resume<span className="brand-light">Builder</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/templates">Templates</Link>
            <Link href="/blog">Resources</Link>
            <Link className="nav-builder" href="/builder">
              Open builder <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </header>
        <ErrorBoundary>
          <ResumeProvider>
            <div id="main-content">{children}</div>
          </ResumeProvider>
        </ErrorBoundary>
        <SiteFooter />
        <OptionalAdvertising />
      </body>
    </html>
  );
}
