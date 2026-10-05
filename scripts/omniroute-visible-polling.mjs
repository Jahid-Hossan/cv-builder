// Browser-only scheduler: one request at a time, hidden-tab pause, bounded backoff.
export function startVisiblePolling(task, options = {}) {
  let stopped = false;
  let running = false;
  let timer = null;
  let failures = 0;
  let nextAllowed = 0;
  const baseInterval = () => Math.max(1000, Number(typeof options.interval === "function" ? options.interval() : options.interval) || 30000);
  const clear = () => { if (timer !== null) clearTimeout(timer); timer = null; };
  const visible = () => document.visibilityState === "visible" && !document.hidden;
  const schedule = () => {
    clear();
    if (stopped || running || !visible()) return;
    timer = setTimeout(run, Math.max(0, nextAllowed - Date.now()));
  };
  async function run() {
    timer = null;
    if (stopped || running || !visible()) return;
    running = true;
    try {
      const ok = await task();
      failures = ok === false ? Math.min(failures + 1, 4) : 0;
    } catch {
      failures = Math.min(failures + 1, 4);
    } finally {
      running = false;
      nextAllowed = Date.now() + Math.min(900000, baseInterval() * 2 ** failures);
      schedule();
    }
  }
  const onVisibility = () => { if (!visible()) clear(); else schedule(); };
  document.addEventListener("visibilitychange", onVisibility);
  nextAllowed = Date.now() + (options.immediate === false ? baseInterval() : 0);
  schedule();
  return () => { stopped = true; clear(); document.removeEventListener("visibilitychange", onVisibility); };
}
