import { siteConfig } from "../config/site";
import { articles } from "../data/articles";
export const dynamic = "force-static";
export default function sitemap() {
  return [
    "",
    "/builder",
    "/templates",
    "/about",
    "/privacy",
    "/contact",
    "/terms",
    "/blog",
  ]
    .map((path) => ({ url: siteConfig.url + path }))
    .concat(
      articles.map((post) => ({
        url: `${siteConfig.url}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt,
      })),
    );
}
