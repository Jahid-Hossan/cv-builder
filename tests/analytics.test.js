import test from 'node:test';
import assert from 'node:assert/strict';
import { analyticsAllowed, analyticsConsentGranted, analyticsPage, initializeAnalytics, sendAnalyticsPage, watchAnalyticsConsent } from '../src/utils/analytics.js';
const id = 'G-JDPCBTQLXD';
function browser() {
  const handlers = new Map();
  let tcf;
  const win = {
    location: { reload() { win.reloads++; } }, reloads: 0,
    addEventListener(name, callback) { handlers.set(name, callback); },
    removeEventListener(name) { handlers.delete(name); },
    __tcfapi(command, version, callback, listenerId) {
      if (command === 'addEventListener') tcf = callback;
      if (command === 'removeEventListener') win.removed = listenerId;
    },
    googlefc: { callbackQueue: [], getGoogleConsentModeValues() { return win.status; } },
    event(tc, success = true) { tcf(tc, success); },
    review() { handlers.get('cv-consent-review')?.(); },
    ready() {
      const queued = win.googlefc.callbackQueue.splice(0);
      for (const entry of queued) for (const fn of Object.values(entry)) fn();
    },
  };
  return win;
}
test('EU analytics requires explicit analytics grant, not advertising consent', () => {
  for (const value of [undefined, {}, { adStoragePurposeConsentStatus: 1 },
    ...[0, 2, 3, 4, true, '1'].map(n => ({ analyticsStoragePurposeConsentStatus: n }))]) {
    assert.equal(analyticsConsentGranted(value), false);
  }
  assert.equal(analyticsConsentGranted({ analyticsStoragePurposeConsentStatus: 1 }), true);
});
test('no GA initialization or events before consent; resume data cannot enter page payload', () => {
  const win = browser();
  const stop = watchAnalyticsConsent(win, id, () => {});
  const page = analyticsPage('https://cvbuilder.appshub.app', '/', ['/']);
  assert.equal(initializeAnalytics(win, id, page), false);
  assert.equal(sendAnalyticsPage(win, id, page), false);
  assert.equal(win.dataLayer, undefined);
  win.status = { analyticsStoragePurposeConsentStatus: 1 };
  win.ready();
  win.event({ cmpStatus: 'loaded', eventStatus: 'tcloaded', gdprApplies: true });
  assert.equal(initializeAnalytics(win, id, page), true);
  assert.equal(sendAnalyticsPage(win, id, page), true);
  const commands = win.dataLayer.map(args => [...args]);
  assert.equal(commands[2][2].send_page_view, false);
  assert.equal(commands[2][2].allow_google_signals, false);
  assert.equal(commands[2][2].allow_ad_personalization_signals, false);
  assert.deepEqual(commands[3], ['event', 'page_view', { ...page, send_to: id }]);
  assert.equal(analyticsPage('https://cvbuilder.appshub.app', '/builder', ['/']), null);
  assert.equal(analyticsPage('https://cvbuilder.appshub.app', '/unknown-name', ['/']), null);
  assert.equal(analyticsPage('https://cvbuilder.appshub.app', '/?name=private', ['/']), null);
  assert.equal(page.page_referrer, '');
  stop();
});
test('privacy review disables immediately, stale grant stays blocked, changed decision reloads', () => {
  const win = browser();
  watchAnalyticsConsent(win, id, () => {});
  win.status = { analyticsStoragePurposeConsentStatus: 1 };
  win.ready();
  win.event({ cmpStatus: 'loaded', eventStatus: 'tcloaded', gdprApplies: true });
  const page = analyticsPage('https://cvbuilder.appshub.app', '/', ['/']);
  initializeAnalytics(win, id, page);
  const before = win.dataLayer.length;
  win.review();
  win.ready();
  assert.equal(sendAnalyticsPage(win, id, page), false);
  assert.equal(win.dataLayer.length, before);
  win.event({ cmpStatus: 'loaded', eventStatus: 'useractioncomplete', listenerId: 5 });
  assert.equal(win.reloads, 1);
  assert.equal(win[`ga-disable-${id}`], true);
});
test('CMP failure disables and unmount removes listener; queued callbacks cannot re-enable', () => {
  const win = browser();
  const stop = watchAnalyticsConsent(win, id, () => {});
  win.status = { analyticsStoragePurposeConsentStatus: 1 };
  win.ready();
  win.event({ listenerId: 12 }, false);
  win.googlefc.callbackQueue.push({ CONSENT_MODE_DATA_READY: () => {} });
  win.ready();
  assert.equal(win[`ga-disable-${id}`], true);
  stop();
  win.ready();
  assert.equal(win.removed, 12);
  assert.equal(win[`ga-disable-${id}`], true);
});

test('regional authorization fails closed for unknown, loading, failed or UI-open CMP', () => {
  const grant = { analyticsStoragePurposeConsentStatus: 1 };
  const stable = { cmpStatus: 'loaded', eventStatus: 'tcloaded' };
  for (const tc of [undefined, stable, { ...stable, gdprApplies: 'false' },
    { ...stable, gdprApplies: false, cmpStatus: 'loading' },
    { ...stable, gdprApplies: false, eventStatus: 'cmpuishown' }]) {
    assert.equal(analyticsAllowed(tc, true, grant), false);
  }
  assert.equal(analyticsAllowed({ ...stable, gdprApplies: false }, false, grant), false);
  for (const status of [undefined, { adStoragePurposeConsentStatus: 1 },
    ...[0, 2, 3, 4].map(n => ({ analyticsStoragePurposeConsentStatus: n }))]) {
    assert.equal(analyticsAllowed({ ...stable, gdprApplies: true }, true, status), false);
  }
  assert.equal(analyticsAllowed({ ...stable, gdprApplies: true }, true, grant), true);
});
test('confirmed non-EU visitor starts without analytics consent or consent-mode configuration', () => {
  for (const status of [undefined, ...[0, 2, 3, 4].map(n => ({ analyticsStoragePurposeConsentStatus: n }))]) {
    const win = browser();
    win.status = status;
    watchAnalyticsConsent(win, id, () => {});
    win.ready();
    assert.equal(win[`ga-disable-${id}`], true);
    win.event({ cmpStatus: 'loaded', eventStatus: 'tcloaded', gdprApplies: false });
    assert.equal(win[`ga-disable-${id}`], false);
    const page = analyticsPage('https://cvbuilder.appshub.app', '/', ['/']);
    assert.equal(initializeAnalytics(win, id, page), true);
    assert.equal(win.dataLayer[0][2].analytics_storage, 'granted');
    assert.equal(sendAnalyticsPage(win, id, page), true);
    win.review();
    assert.equal(sendAnalyticsPage(win, id, page), false);
  }
});
test('EU consent can arrive before or after regional data; explicit rejection stays blocked', () => {
  for (const regionFirst of [true, false]) {
    const win = browser();
    watchAnalyticsConsent(win, id, () => {});
    const tc = { cmpStatus: 'loaded', eventStatus: 'tcloaded', gdprApplies: true };
    if (regionFirst) win.event(tc);
    win.status = { analyticsStoragePurposeConsentStatus: 1 };
    win.ready();
    if (!regionFirst) {
      assert.equal(win[`ga-disable-${id}`], true);
      win.event(tc);
    }
    assert.equal(win[`ga-disable-${id}`], false);
  }
  const win = browser();
  watchAnalyticsConsent(win, id, () => {});
  win.status = { analyticsStoragePurposeConsentStatus: 2 };
  win.event({ cmpStatus: 'loaded', eventStatus: 'useractioncomplete', gdprApplies: true });
  win.ready();
  assert.equal(win[`ga-disable-${id}`], true);
});
