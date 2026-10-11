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
const allowedOrigins = [siteConfig.url, ...(siteConfig.testOrigins || [])];

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
    const originMatches = allowedOrigins.includes(window.location.origin);
    if (!validId || !originMatches) {
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
    const originMatches = allowedOrigins.includes(window.location.origin);
    const allowed = consented && Boolean(page) && originMatches;
    console.log('[OptionalAnalytics] page gate:', { consented, hasPage: Boolean(page), originMatches, loaded, allowed });
    window[`ga-disable-${GA_ID}`] = !allowed;
    if (!allowed) { console.log('[OptionalAnalytics] STOP: page gate denied'); lastPage.current = null; return; }
    if (!loaded) { console.log('[OptionalAnalytics] WAIT: GA4 script not ready'); return; }
    if (!configured.current) {
      configured.current = initializeAnalytics(window, GA_ID, page);
      console.log('[OptionalAnalytics] analytics initialized:', configured.current);
    }
    if (configured.current && lastPage.current !== page.page_path && sendAnalyticsPage(window, GA_ID, page)) {
      console.log('[OptionalAnalytics] page view SENT');
      console.log('[OptionalAnalytics] runtime:', JSON.stringify({
        gtag: typeof window.gtag, dataLayer: typeof window.dataLayer,
        dataLayerIsArray: Array.isArray(window.dataLayer),
      }));
      setTimeout(() => {
        const requests = window.performance.getEntriesByType('resource')
          .filter(entry => /https:\/\/([a-z0-9-]+\.)?(google-analytics\.com|googletagmanager\.com)\//.test(entry.name))
          .map(entry => { const url = new URL(entry.name); return { host: url.host, path: url.pathname, status: entry.responseStatus }; });
        console.log('[OptionalAnalytics] network:', JSON.stringify(requests));
      }, 3000);
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
