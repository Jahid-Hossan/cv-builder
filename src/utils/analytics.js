// Within the regulated region, only an explicit analytics grant authorizes GA.
export function analyticsConsentGranted(status) {
  return status?.analyticsStoragePurposeConsentStatus === 1;
}

export function analyticsAllowed(tc, success, status) {
  if (!success || tc?.cmpStatus !== 'loaded' ||
      !['tcloaded', 'useractioncomplete'].includes(tc.eventStatus)) return false;
  if (tc.gdprApplies === false) return true;
  return tc.gdprApplies === true && analyticsConsentGranted(status);
}

export function watchAnalyticsConsent(win, measurementId, onChange) {
  let active = true;
  let subscribed = false;
  let listenerId;
  let reviewing = false;
  let previouslyGranted = false;
  let regionData;
  let regionReady = false;
  const disableKey = `ga-disable-${measurementId}`;
  const update = allowed => {
    if (!active) return;
    win[disableKey] = !allowed;
    if (allowed) previouslyGranted = true;
    onChange(allowed);
  };
  update(false);
  const fc = win.googlefc = win.googlefc || {};
  fc.callbackQueue = fc.callbackQueue || [];
  const readConsent = () => {
    if (!active || reviewing) return;
    try {
      // Non-EU visitors do not require consent-mode values to be configured.
      if (analyticsAllowed(regionData, regionReady, undefined)) {
        update(true);
      } else {
        update(analyticsAllowed(regionData, regionReady, fc.getGoogleConsentModeValues?.()));
      }
    } catch {
      update(false);
    }
  };
  const review = () => {
    reviewing = true;
    update(false);
  };
  win.addEventListener('cv-consent-review', review);
  const subscribe = () => {
    if (!active || subscribed || typeof win.__tcfapi !== 'function') return;
    subscribed = true;
    win.__tcfapi('addEventListener', 2, (tc, success) => {
      if (!active) return;
      if (tc?.listenerId !== undefined) listenerId = tc.listenerId;
      regionData = tc;
      regionReady = success === true;
      if (!success || tc?.cmpStatus !== 'loaded') {
        review();
        return;
      }
      if (tc.eventStatus === 'cmpuishown') {
        review();
        return;
      }
      if (['tcloaded', 'useractioncomplete'].includes(tc.eventStatus)) {
        // Unload existing analytics listeners on any changed decision. Do not
        // briefly re-enable from stale consent-mode values during CMP updates.
        if (tc.eventStatus === 'useractioncomplete' && previouslyGranted) {
          review();
          win.location.reload();
          return;
        }
        reviewing = false;
        readConsent();
        fc.callbackQueue.push({ CONSENT_MODE_DATA_READY: readConsent });
      }
    });
  };
  fc.callbackQueue.push({ CONSENT_API_READY: subscribe });
  fc.callbackQueue.push({ CONSENT_DATA_READY: subscribe });
  fc.callbackQueue.push({ CONSENT_MODE_DATA_READY: readConsent });
  subscribe();
  return () => {
    update(false);
    active = false;
    win.removeEventListener('cv-consent-review', review);
    if (listenerId !== undefined && typeof win.__tcfapi === 'function') {
      win.__tcfapi('removeEventListener', 2, () => {}, listenerId);
    }
  };
}

export function analyticsPage(origin, pathname, allowedPaths) {
  const path = pathname?.replace(/\/+$/, '') || '/';
  if (!allowedPaths.includes(path)) return null;
  // No document title, search parameters, fragment, referrer or form values.
  return {
    page_location: `${origin}${path}`,
    page_path: path,
    page_title: path === '/' ? 'CV Builder' : path,
    page_referrer: '',
  };
}

export function initializeAnalytics(win, measurementId, page) {
  if (win[`ga-disable-${measurementId}`] !== false || !page) return false;
  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || function () { win.dataLayer.push(arguments); };
  win.gtag('consent', 'default', {
    analytics_storage: 'granted', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
  });
  win.gtag('js', new Date());
  win.gtag('config', measurementId, {
    ...page, send_page_view: false, allow_google_signals: false,
    allow_ad_personalization_signals: false, ignore_referrer: true,
  });
  return true;
}

export function sendAnalyticsPage(win, measurementId, page) {
  if (win[`ga-disable-${measurementId}`] !== false || !page || typeof win.gtag !== 'function') return false;
  win.gtag('event', 'page_view', { ...page, send_to: measurementId });
  return true;
}
