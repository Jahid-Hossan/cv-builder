// Google vendor 755. Unknown/error/UI-open states never authorize requests.
export function adDecision(tc, success) {
  if (!success || !tc || tc.cmpStatus !== 'loaded') return false;
  if (!['tcloaded', 'useractioncomplete'].includes(tc.eventStatus)) return false;
  if (tc.gdprApplies === false) return true;
  if (tc.gdprApplies !== true || !tc.tcString) return false;
  const vendor = 755;
  const consent = id => tc.purpose?.consents?.[id] === true && tc.vendor?.consents?.[vendor] === true;
  const interest = id => tc.purpose?.legitimateInterests?.[id] === true && tc.vendor?.legitimateInterests?.[vendor] === true;
  return [1, 3, 4, 2, 7, 9, 10].every(id => {
    const restriction = tc.publisher?.restrictions?.[id]?.[vendor];
    if (restriction === 0) return false;
    if ([1, 3, 4].includes(id)) return restriction !== 2 && consent(id);
    return restriction === 1 ? consent(id) : restriction === 2 ? interest(id) : (consent(id) || interest(id));
  });
}
export function excludedFromAds(path) {
  return ['/builder', '/templates'].includes(path.replace(/\/+$/, ''));
}
export function pauseAds() {
  (window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 1;
}
