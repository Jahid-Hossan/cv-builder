"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { siteConfig, validAdsenseId } from "../config/site";
// The owner must wire a real CMP to this bridge. No consent is assumed or stored here.
export default function OptionalAdvertising() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const update = () =>
      setAllowed(
        window.location.origin === siteConfig.url &&
          window.cvBuilderConsent?.advertising === true,
      );
    update();
    window.addEventListener("cv-builder-consent-change", update);
    return () =>
      window.removeEventListener("cv-builder-consent-change", update);
  }, []);
  // Never run third-party advertising code on pages displaying saved resume data.
  if (
    !allowed ||
    !validAdsenseId(siteConfig.adsenseClientId) ||
    ["/builder", "/templates"].includes(pathname?.replace(/\/+$/, ""))
  )
    return null;
  return (
    <Script
      id="cv-builder-adsense"
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClientId}`}
    />
  );
}
