"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { excludedFromAds, pauseAds } from '../utils/consent';
export default function PrivacySettings() {
  const [available, setAvailable] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    setAvailable(false);
    if (excludedFromAds(pathname)) return;
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({ CONSENT_API_READY: () => {
      if (active) setAvailable(typeof window.googlefc.showRevocationMessage === 'function');
    }});
    return () => { active = false; };
  }, [pathname]);
  if (!available || excludedFromAds(pathname)) return null;
  return <button type="button" className="privacy-settings" onClick={() => {
    pauseAds();
    window.dispatchEvent(new Event('cv-consent-review'));
    window.googlefc.callbackQueue.push({ CONSENT_API_READY: () => window.googlefc.showRevocationMessage() });
  }}>Privacy and cookie settings</button>;
}
