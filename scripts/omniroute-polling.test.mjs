import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

function harness() {
  let now = 0, id = 0;
  const timers = new Map(), listeners = new Set();
  const document = { hidden: false, visibilityState: 'visible', addEventListener: (_, f) => listeners.add(f), removeEventListener: (_, f) => listeners.delete(f) };
  const context = vm.createContext({ document, Date: { now: () => now }, setTimeout: (f, ms) => { timers.set(++id, { f, at: now + ms }); return id; }, clearTimeout: id => timers.delete(id) });
  vm.runInContext(readFileSync(new URL('./omniroute-visible-polling.mjs', import.meta.url), 'utf8').replace('export function', 'function') + '\nglobalThis.start = startVisiblePolling;', context);
  return {
    start: context.start, timers, listeners,
    hide(value) { document.hidden = value; document.visibilityState = value ? 'hidden' : 'visible'; for (const f of listeners) f(); },
    async advance(ms) { now += ms; for (const [id, t] of [...timers]) if (t.at <= now) { timers.delete(id); await t.f(); } await Promise.resolve(); },
    next() { return Math.min(...[...timers.values()].map(t => t.at - now)); }
  };
}
test('minimum interval and no duplicate request when visibility toggles', async () => {
  const h = harness(); let calls = 0; const stop = h.start(async () => { calls++; return true; }, { interval: 30000 });
  await h.advance(0); assert.equal(calls, 1); h.hide(true); h.hide(false); await h.advance(29999); assert.equal(calls, 1); await h.advance(1); assert.equal(calls, 2); stop();
});
test('hidden initial mount sends zero requests and resumes when visible', async () => {
  const h = harness(); h.hide(true); let calls = 0; const stop = h.start(async () => calls++, { interval: 60000 });
  await h.advance(120000); assert.equal(calls, 0); h.hide(false); await h.advance(0); assert.equal(calls, 1); stop();
});
test('failures back off exponentially and success restores base interval', async () => {
  const h = harness(); let calls = 0; const stop = h.start(async () => ++calls >= 3, { interval: 30000 });
  await h.advance(0); assert.equal(h.next(), 60000); await h.advance(60000); assert.equal(h.next(), 120000); await h.advance(120000); assert.equal(h.next(), 30000); stop();
});
test('requests do not overlap and cleanup prevents rearming after pending work', async () => {
  const h = harness(); let resolve, calls = 0; const stop = h.start(() => { calls++; return new Promise(r => resolve = r); }, { interval: 30000 });
  const pending = h.advance(0); await Promise.resolve(); h.hide(true); h.hide(false); assert.equal(calls, 1); assert.equal(h.timers.size, 0); stop(); resolve(true); await pending; assert.equal(h.timers.size, 0); assert.equal(h.listeners.size, 0);
});
test('visibility cycling cannot bypass an existing failure backoff', async () => {
  const h = harness(); let calls = 0; const stop = h.start(async () => { calls++; return false; }, { interval: 60000 });
  await h.advance(0); h.hide(true); h.hide(false); await h.advance(60000); assert.equal(calls, 1); await h.advance(60000); assert.equal(calls, 2); stop();
});
