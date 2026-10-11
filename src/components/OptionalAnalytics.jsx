"use client";
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { siteConfig } from '../config/site';
import { analyticsCountryRegion, analyticsPage, detectAnalyticsCountry, initializeAnalytics, sendAnalyticsPage, watchAnalyticsConsent } from '../utils/analytics';

console.log('[OptionalAnalytics] MODULE LOADED');

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const validId = /^G-[A-Z0-9]+$/.test(GA_ID);
// The editor and templates never load analytics or send interaction events.
const publicPaths = ['/', '/about', '/blog', '/contact', '/privacy', '/terms'];

export default function OptionalAnalytics({ articlePaths }) {
  console.log('[OptionalAnalytics] COMPONENT RENDERED');
  const pathname = usePathname();
  const [consented, setConsented] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const configured = useRef(false);
  const lastPage = useRef(null);
  const page = analyticsPage(siteConfig.url, pathname, [...publicPaths, ...articlePaths]);

  useEffect(() => {
    console.log('[OptionalAnalytics] useEffect FIRED');
    console.log('[OptionalAnalytics] gate:', { validId, measurementId: GA_ID, origin: window.location.origin, expectedOrigin: siteConfig.url });
    if (!validId || window.location.origin !== siteConfig.url) {
      console.log('[OptionalAnalytics] STOP: invalid measurement ID or origin mismatch');
      return;
    }
    let active = true;
    let stop;
    window[`ga-disable-${GA_ID}`] = true;
    console.log('[OptionalAnalytics] country detection STARTED');
    detectAnalyticsCountry(window).then(country => {
      console.log('[OptionalAnalytics] country:', country);
      console.log('[OptionalAnalytics] isEU:', analyticsCountryRegion(country) === 'eu');
      if (!active) { console.log('[OptionalAnalytics] STOP: effect inactive'); return; }
      console.info('[AnalyticsLoader] country:', country, 'region:', analyticsCountryRegion(country));
      stop = watchAnalyticsConsent(window, GA_ID, setConsented, country);
    });
    return () => {
      console.log('[OptionalAnalytics] consent effect CLEANUP');
      active = false;
      stop?.();
      window[`ga-disable-${GA_ID}`] = true;
    };
  }, []);

  useEffect(() => {
    console.log('[OptionalAnalytics] page effect FIRED');
    if (!validId) { console.log('[OptionalAnalytics] STOP: invalid measurement ID'); return; }
    const allowed = consented && Boolean(page) && window.location.origin === siteConfig.url;
    console.log('[OptionalAnalytics] page gate:', { consented, hasPage: Boolean(page), originMatches: window.location.origin === siteConfig.url, loaded, allowed });
    window[`ga-disable-${GA_ID}`] = !allowed;
    if (!allowed) { console.log('[OptionalAnalytics] STOP: page gate denied'); lastPage.current = null; return; }
    if (!loaded) { console.log('[OptionalAnalytics] WAIT: GA4 script not ready'); return; }
    if (!configured.current) {
      configured.current = initializeAnalytics(window, GA_ID, page);
      console.log('[OptionalAnalytics] analytics initialized:', configured.current);
    }
    if (configured.current && lastPage.current !== page.page_path && sendAnalyticsPage(window, GA_ID, page)) {
      console.log('[OptionalAnalytics] page view SENT');
      lastPage.current = page.page_path;
    }
  }, [consented, loaded, pathname]);

  if (!validId || !consented || !page) {
    console.log('[OptionalAnalytics] render NULL:', { validId, consented, hasPage: Boolean(page) });
    return null;
  }
  console.log('[OptionalAnalytics] render GA4 SCRIPT');
  return <Script id="cv-builder-ga4" strategy="afterInteractive"
    src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
    onReady={() => { console.log('[OptionalAnalytics] GA4 script READY'); setLoaded(true); }}
    onError={() => { console.log('[OptionalAnalytics] GA4 script ERROR'); console.warn('[AnalyticsLoader] GA4 script failed to load'); }} />;
}
