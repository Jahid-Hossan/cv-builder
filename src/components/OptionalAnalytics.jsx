"use client";
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { siteConfig } from '../config/site';
import { analyticsPage, initializeAnalytics, sendAnalyticsPage, watchAnalyticsConsent } from '../utils/analytics';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const validId = /^G-[A-Z0-9]+$/.test(GA_ID);
// The editor and templates never load analytics or send interaction events.
const publicPaths = ['/', '/about', '/blog', '/contact', '/privacy', '/terms'];

export default function OptionalAnalytics({ articlePaths }) {
  const pathname = usePathname();
  const [consented, setConsented] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const configured = useRef(false);
  const lastPage = useRef(null);
  const page = analyticsPage(siteConfig.url, pathname, [...publicPaths, ...articlePaths]);

  useEffect(() => {
    if (!validId || window.location.origin !== siteConfig.url) return;
    return watchAnalyticsConsent(window, GA_ID, setConsented);
  }, []);

  useEffect(() => {
    if (!validId) return;
    const allowed = consented && Boolean(page) && window.location.origin === siteConfig.url;
    window[`ga-disable-${GA_ID}`] = !allowed;
    if (!allowed) { lastPage.current = null; return; }
    if (!loaded) return;
    if (!configured.current) configured.current = initializeAnalytics(window, GA_ID, page);
    if (configured.current && lastPage.current !== page.page_path && sendAnalyticsPage(window, GA_ID, page)) {
      lastPage.current = page.page_path;
    }
  }, [consented, loaded, pathname]);

  if (!validId || !consented || !page) return null;
  return <Script id="cv-builder-ga4" strategy="afterInteractive"
    src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
    onReady={() => setLoaded(true)} />;
}
