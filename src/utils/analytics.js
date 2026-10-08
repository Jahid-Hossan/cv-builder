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

export function watchAnalyticsConsent(win, measurementId, onChange, country) {
  let active = true;
  let subscribed = false;
  let listenerId;
  let reviewing = false;
  let previouslyGranted = false;
  let regionData;
  let regionReady = false;
  // The production loader always supplies the trace result, including XX.
  const countryRegion = analyticsCountryRegion(country);
  const useTrace = country !== undefined;
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
      if (useTrace && countryRegion === 'unknown') { update(false); return; }
      if (useTrace && countryRegion === 'non-eu') { update(true); return; }
      // A trace-detected EU country cannot be overridden by gdprApplies=false.
      const tc = useTrace && regionData ? { ...regionData, gdprApplies: true } : regionData;
      // Non-EU visitors do not require consent-mode values to be configured.
      if (analyticsAllowed(tc, regionReady, undefined)) {
        update(true);
      } else {
        update(analyticsAllowed(tc, regionReady, fc.getGoogleConsentModeValues?.()));
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
        if (useTrace && countryRegion === 'non-eu') return;
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
  if (useTrace) readConsent();
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
export const COUNTRY_CACHE_KEY = 'cv-country-cache';
export const COUNTRY_CACHE_TTL = 30 * 60 * 1000;
const EU_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU',
  'IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES',
  'SE','IS','LI','NO','GB','CH',
]);
// Validate ISO country codes; XX and Cloudflare's Tor marker T1 never grant GA.
const ISO_COUNTRIES = new Set(('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ ' +
  'BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ ' +
  'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY ' +
  'HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY ' +
  'MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ ' +
  'NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY ' +
  'QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ ' +
  'TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ ' +
  'VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' '));

export function analyticsCountryRegion(country) {
  if (!ISO_COUNTRIES.has(country)) return 'unknown';
  return EU_COUNTRIES.has(country) ? 'eu' : 'non-eu';
}

export function parseAnalyticsCountry(trace) {
  if (typeof trace !== 'string' || trace.length > 16384) return 'XX';
  const lines = trace.trim().split(/\r?\n/);
  if (!lines.every(line => /^[a-z_]+=[^\r\n]*$/.test(line))) return 'XX';
  const locations = lines.filter(line => line.startsWith('loc='));
  if (locations.length !== 1) return 'XX';
  const country = locations[0].slice(4);
  return ISO_COUNTRIES.has(country) ? country : 'XX';
}

export async function detectAnalyticsCountry(win) {
  const now = Date.now();
  try {
    const cache = JSON.parse(win.sessionStorage.getItem(COUNTRY_CACHE_KEY));
    if (cache && (ISO_COUNTRIES.has(cache.country) || cache.country === 'XX') &&
        Number.isFinite(cache.timestamp) && now >= cache.timestamp &&
        now - cache.timestamp < COUNTRY_CACHE_TTL) return cache.country;
  } catch { /* Storage may be unavailable; attempt a fresh lookup. */ }
  const controller = new AbortController();
  let timeout;
  try {
    const request = (async () => {
      const response = await win.fetch('/cdn-cgi/trace', {
        signal: controller.signal, cache: 'no-store', credentials: 'omit',
        redirect: 'error',
      });
      if (!response.ok) return 'XX';
      // Never store or log the IP address, user agent or full trace response.
      return parseAnalyticsCountry(await response.text());
    })();
    const country = await Promise.race([request, new Promise(resolve => {
      timeout = setTimeout(() => { controller.abort(); resolve('XX'); }, 2000);
    })]);
    if (country !== 'XX') {
      try {
        win.sessionStorage.setItem(COUNTRY_CACHE_KEY,
          JSON.stringify({ country, timestamp: Date.now() }));
      } catch { /* No storage does not prevent a verified lookup. */ }
    }
    return country;
  } catch {
    return 'XX';
  } finally {
    clearTimeout(timeout);
  }
}

