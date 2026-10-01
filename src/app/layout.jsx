import Link from "next/link";
import "./globals.css";
import { ResumeProvider } from "../context/ResumeContext";
import ErrorBoundary from "../components/ErrorBoundary";
export const metadata = {
  title: "Resume Builder — Your next chapter",
  description:
    "Create a thoughtful resume, privately in your browser. 15 templates, live preview, color and font customization, and local PDF export.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
