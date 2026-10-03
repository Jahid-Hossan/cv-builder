import Link from "../../components/SiteLink";
import { articles } from "../../data/articles";
import { pageMetadata, formatDate } from "../../config/site";
export const metadata = pageMetadata(
  "Resume Resources",
  "Practical guides to resume formats, achievement-based experience descriptions and the final application checklist.",
  "/blog",
);
export default function Blog() {
  return (
    <main className="content-page resource-page">
      <p className="eyebrow">RESUME RESOURCES</p>
      <h1>Better words. Clearer applications.</h1>
      <p>
        Practical guidance for choosing a format, explaining your work and
        reviewing your document. Employer instructions always come first.
      </p>
      <div className="resource-grid">
        {articles.map((post) => (
          <article className="resource-card" key={post.slug}>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.description}</p>
            <Link href={`/blog/${post.slug}`}>Read the guide →</Link>
          </article>
        ))}
      </div>
      <p>
        <Link href="/builder">Open the resume builder</Link> or{" "}
        <Link href="/templates">choose a template</Link>.
      </p>
    </main>
  );
}
