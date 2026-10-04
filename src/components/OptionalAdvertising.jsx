"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { siteConfig, validAdsenseId } from "../config/site";
import { adDecision, excludedFromAds, pauseAds } from "../utils/consent";

export default function OptionalAdvertising() {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    setInitialized(false);
    pauseAds();
    if (excludedFromAds(pathname) || !validAdsenseId(siteConfig.adsenseClientId) || window.location.origin !== siteConfig.url) return;
    let active = true, subscribed = false, listenerId, previouslyAllowed = false, reviewing = false;
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    const beginReview = () => { reviewing = true; pauseAds(); };
    window.addEventListener('cv-consent-review', beginReview);
    const subscribe = () => {
      if (!active || subscribed || typeof window.__tcfapi !== 'function') return;
      subscribed = true;
      window.__tcfapi('addEventListener', 2, (tc, success) => {
        if (!active) return;
        if (tc?.listenerId !== undefined) listenerId = tc.listenerId;
        if (reviewing && tc?.eventStatus !== 'useractioncomplete') { pauseAds(); return; }
        if (tc?.eventStatus === 'useractioncomplete') reviewing = false;
        const allowed = adDecision(tc, success);
        (window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = allowed ? 0 : 1;
        // Unload running ad scripts/iframes after a settled withdrawal. CMP owns persistence.
        if (!allowed && previouslyAllowed && success && tc?.eventStatus === 'useractioncomplete') {
          window.location.reload();
          return;
        }
        if (allowed) previouslyAllowed = true;
      });
    };
    window.googlefc.callbackQueue.push({ CONSENT_API_READY: subscribe });
    window.googlefc.callbackQueue.push({ CONSENT_DATA_READY: subscribe });
    subscribe();
    // React inserts AdSense only after pause + callbacks have been installed.
    setInitialized(true);
    return () => {
      active = false;
      pauseAds();
      window.removeEventListener('cv-consent-review', beginReview);
      if (listenerId !== undefined && typeof window.__tcfapi === 'function')
        window.__tcfapi('removeEventListener', 2, () => {}, listenerId);
    };
  }, [pathname]);
  if (!initialized || excludedFromAds(pathname) || !validAdsenseId(siteConfig.adsenseClientId)) return null;
  return <Script id="cv-builder-adsense" strategy="afterInteractive" async crossOrigin="anonymous"
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClientId}`} />;
}
