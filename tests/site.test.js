import test from "node:test";
import assert from "node:assert/strict";
import {
  siteConfig,
  validAdsenseId,
  validAffiliate,
  validEmail,
  pageMetadata,
} from "../src/config/site.js";
import { articles } from "../src/data/articles.js";
test("optional services reject placeholders and unsafe destinations", () => {
  for (const id of [
    "",
    "ca-pub-XXXXXXXXXXXXXXXX",
    "ca-pub-0000000000000000",
    "pub-123",
  ])
    assert.equal(validAdsenseId(id), false);
  assert.equal(validAdsenseId("ca-pub-1234567890123456"), true); // synthetic test value, never site config
  const offer = {
    enabled: true,
    name: "Service",
    url: "https://example.com",
    disclosure: "Affiliate",
  };
  assert.equal(validAffiliate(offer), true);
  for (const patch of [
    { enabled: false },
    { name: "" },
    { url: "javascript:alert(1)" },
    { url: "http://example.com" },
    { disclosure: "" },
  ])
    assert.equal(Boolean(validAffiliate({ ...offer, ...patch })), false);
  assert.equal(validEmail("bad\n@example.com"), false);
});
test("metadata uses one canonical production origin and distinct pages", () => {
  const urls = new Set();
  for (const path of ["/", "/about", "/blog", "/templates", "/builder"]) {
    const meta = pageMetadata(path, "Description", path);
    assert.equal(new URL(meta.alternates.canonical).origin, siteConfig.url);
    assert.equal(meta.openGraph.url, meta.alternates.canonical);
    urls.add(meta.alternates.canonical);
  }
  assert.equal(urls.size, 5);
});
test("published resources have substantial distinct content, fixed dates and valid related links", () => {
  assert.equal(new Set(articles.map((p) => p.slug)).size, articles.length);
  assert.equal(new Set(articles.map((p) => p.title)).size, articles.length);
  for (const post of articles) {
    const body = [
      post.intro,
      ...post.sections.flatMap((s) => [
        ...(s.paragraphs || []),
        ...((s.subsections || []).flatMap((sub) => sub.paragraphs || [])),
      ]),
    ].join(" ");
    assert.ok(body.split(/\s+/).length >= 800);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt));
    assert.ok(
      post.relatedPosts.every((id) => articles.some((p) => p.slug === id)),
    );
    if (post.slug !== "achievement-based-resume-bullets")
      assert.ok(body.includes("image-based"));
  }
});
