import Link from "../components/SiteLink";
export default function NotFound() {
  return (
    <main className="content-page">
      <h1>Page not found</h1>
      <p>This address does not match a page on CV Builder.</p>
      <p>
        <Link href="/">Return home</Link> or{" "}
        <Link href="/builder">open the resume builder</Link>.
      </p>
    </main>
  );
}
