"use client";
import { siteConfig, validAffiliate } from "../config/site";
export default function AffiliateOffer() {
  const offer = siteConfig.affiliate;
  if (!validAffiliate(offer)) return null;
  return (
    <aside className="affiliate-offer" aria-label="Optional resume service">
      <h2>Need additional resume help?</h2>
      <p>
        <a href={offer.url} target="_blank" rel="sponsored noopener noreferrer">
          Explore {offer.name}
        </a>
      </p>
      <p className="help">{offer.disclosure}</p>
    </aside>
  );
}
