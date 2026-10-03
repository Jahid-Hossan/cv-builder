import Link from "../../../components/SiteLink";
import { notFound } from "next/navigation";
import { articles } from "../../../data/articles";
import { siteConfig, pageMetadata, formatDate } from "../../../config/site";
import StructuredData from "../../../components/StructuredData";
export const dynamicParams = false;
export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = articles.find((p) => p.slug === slug);
  if (!post) notFound();
  const meta = pageMetadata(post.title, post.description, `/blog/${slug}`);
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
    },
  };
}
export default async function Article({ params }) {
  const { slug } = await params;
  const post = articles.find((p) => p.slug === slug);
  if (!post) notFound();
  const url = `${siteConfig.url}/blog/${post.slug}`;
  return (
    <main className="content-page article-page">
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/blog">Resources</Link>
      </nav>
      <article>
        <h1>{post.title}</h1>
        <p className="article-date">
          Published{" "}
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
        </p>
        <p className="article-intro">{post.intro}</p>
        {post.sections.map((section, index) => (
          <section
            key={section.heading}
            aria-labelledby={`article-section-${index}`}
          >
            <h2 id={`article-section-${index}`}>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {section.subsections?.map((sub, subIdx) => (
              <div key={subIdx} className="article-subsection">
                <h3 id={`article-sub-${index}-${subIdx}`}>{sub.heading}</h3>
                {sub.paragraphs?.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ))}
          </section>
        ))}
        <p>
          <Link href="/builder">Apply these ideas in the resume builder</Link>{" "}
          or <Link href="/templates">compare the 15 templates</Link>.
        </p>
      </article>
      <aside aria-label="Related resources">
        <h2>Continue reading</h2>
        <ul>
          {post.relatedPosts.map((id) => {
            const related = articles.find((p) => p.slug === id);
            return related ? (
              <li key={id}>
                <Link href={`/blog/${id}`}>{related.title}</Link>
              </li>
            ) : null;
          })}
        </ul>
      </aside>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
          mainEntityOfPage: url,
          url,
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteConfig.url,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Resources",
              item: `${siteConfig.url}/blog`,
            },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        }}
      />
    </main>
  );
}
