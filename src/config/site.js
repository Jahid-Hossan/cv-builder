export const siteConfig = {
  name: "CV Builder",
  url: "https://cvbuilder.appshub.app",
  description:
    "Build a resume privately in your browser with 15 templates, live preview, custom fonts and colors, and PDF download.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
  affiliate: {
    enabled: process.env.NEXT_PUBLIC_AFFILIATE_ENABLED === "true",
    name: process.env.NEXT_PUBLIC_AFFILIATE_NAME || "",
    url: process.env.NEXT_PUBLIC_AFFILIATE_URL || "",
    disclosure:
      "Some links may be affiliate links. We may earn a commission at no additional cost to you.",
  },
};
export const validAdsenseId = (id) =>
  /^ca-pub-\d{16}$/.test(id) && !/^ca-pub-0+$/.test(id);
export const validEmail = (email) =>
  /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) && !/[\r\n]/.test(email);
export function validAffiliate(offer) {
  try {
    return (
      offer.enabled &&
      !!offer.name.trim() &&
      new URL(offer.url).protocol === "https:" &&
      !!offer.disclosure.trim()
    );
  } catch {
    return false;
  }
}
export function pageMetadata(title, description, path) {
  const url = siteConfig.url + (path === "/" ? "" : path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
