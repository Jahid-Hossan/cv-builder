import fs from 'node:fs';
import path from 'node:path';
const root = process.argv[2] || '/app';
const helper = fs.readFileSync(new URL('./omniroute-visible-polling.mjs', import.meta.url), 'utf8');
const changes = [];
function once(s, from, to) {
  const count = typeof from === 'string' ? s.split(from).length - 1 : [...s.matchAll(new RegExp(from.source, from.flags.replace('g', '') + 'g'))].length;
  if (count !== 1) throw new Error(`Patch anchor must match once: ${String(from).slice(0, 100)} (${count})`);
  return s.replace(from, to);
}
function patch(file, fn) {
  const full = path.join(root, file), original = fs.readFileSync(full, 'utf8');
  if (original.includes('startVisiblePolling')) throw new Error(`Already patched: ${file}`);
  let modified = fn(original);
  modified = once(modified, '"use client";', '"use client";\nimport { startVisiblePolling } from "@/shared/utils/visiblePolling";');
  changes.push({ full, modified, file });
}
patch('src/shared/components/ProviderTestSlideOver.tsx', s => {
  s = once(s, 'setState({ status: "ready", logs });', 'setState({ status: "ready", logs });\n        return true;');
  s = once(s, 'setState({ status: "error", message: (err as Error).message || t("failedToLoadLogs") });', 'setState({ status: "error", message: (err as Error).message || t("failedToLoadLogs") });\n        return false;');
  s = once(s, 'void load();\n    const interval = setInterval(load, 2000);', 'const stopPolling = startVisiblePolling(load, { interval: 30000 });');
  return once(s, 'clearInterval(interval);', 'stopPolling();');
});
patch('src/shared/components/MaintenanceBanner.tsx', s => {
  s = once(s, '      } catch {', '        return res.ok;\n      } catch {');
  s = once(s, '      } finally {', '        return false;\n      } finally {');
  return once(s, '// Run immediately on mount, then every 10 seconds\n    checkHealth();\n    const interval = setInterval(checkHealth, 10000);\n    return () => clearInterval(interval);', '// Check only while visible, at least 60 seconds apart, with failure backoff.\n    return startVisiblePolling(checkHealth, { interval: 60000 });');
});
patch('src/app/(dashboard)/dashboard/HomePageClient.tsx', s => once(s,
  /  useEffect\(\(\) => \{\n    if \(!appearanceSettingsLoaded \|\| !showProviderTopologyOnHome\)[\s\S]*?\n  \}, \[appearanceSettingsLoaded, showProviderTopologyOnHome\]\);/,
  `  useEffect(() => {
    if (!appearanceSettingsLoaded || !showProviderTopologyOnHome) return;
    let cancelled = false;
    let controller: AbortController | null = null;
    const stopPolling = startVisiblePolling(async () => {
      const currentController = new AbortController();
      controller = currentController;
      const timeout = setTimeout(() => currentController.abort(), 15000);
      try {
        const metricsRes = await fetch("/api/provider-metrics", { cache: "no-store", signal: currentController.signal });
        if (!metricsRes.ok) return false;
        const data = await metricsRes.json();
        if (cancelled) return true;
        setProviderMetrics(data.metrics || {});
        setProviderTopology({ lastProvider: normalizeProviderId(data.topology?.lastProvider), errorProvider: normalizeProviderId(data.topology?.errorProvider) });
        return true;
      } catch (error) {
        if (!cancelled) console.error("Failed to load topology activity:", error);
        return false;
      } finally {
        clearTimeout(timeout);
        if (controller === currentController) controller = null;
      }
    }, { interval: 60000 });
    return () => { cancelled = true; stopPolling(); controller?.abort(); };
  }, [appearanceSettingsLoaded, showProviderTopologyOnHome]);`));
patch('src/shared/components/RequestLoggerV2.tsx', s => {
  s = once(s, '  DEFAULT_REFRESH_INTERVAL_SEC,', '  DEFAULT_REFRESH_INTERVAL_SEC as ORIGINAL_DEFAULT_REFRESH_INTERVAL_SEC,');
  s = once(s, '  clampRefreshIntervalSec,', '  clampRefreshIntervalSec as originalClampRefreshIntervalSec,');
  s = once(s, '  readSavedRefreshIntervalSec,', '  readSavedRefreshIntervalSec as originalReadSavedRefreshIntervalSec,');
  s = once(s, '} from "./requestLoggerPreferences";', '} from "./requestLoggerPreferences";\nconst DEFAULT_REFRESH_INTERVAL_SEC = Math.max(30, ORIGINAL_DEFAULT_REFRESH_INTERVAL_SEC);\nconst clampRefreshIntervalSec = (value) => Math.max(30, originalClampRefreshIntervalSec(value));\nconst readSavedRefreshIntervalSec = () => clampRefreshIntervalSec(originalReadSavedRefreshIntervalSec());');
  s = once(s, '    const intervalRef = useRef(null);\n', '');
  s = once(s, '    const visibleRef = useRef(true);\n', '');
  s = once(s, '        if (showLoading) setLoading(true);', '        if (document.hidden) return true;\n        if (showLoading) setLoading(true);');
  s = once(s, '          const res = await fetch(`/api/usage/call-logs?${params}`);', '          const res = await fetch(`/api/usage/call-logs?${params}`);\n          if (!res.ok) return false;');
  s = once(s, '        } catch (error) {\n          console.error("Failed to fetch call logs:", error);', '          return true;\n        } catch (error) {\n          console.error("Failed to fetch call logs:", error);\n          return false;');
  s = once(s, /    \/\/ Visibility-aware auto-refresh:[\s\S]*?\n    \}, \[recording, fetchLogs, limit, refreshIntervalSec, selectedLog\]\);/,
    `    // Poll only visible tabs; old saved intervals are clamped to at least 30s.
    useEffect(() => {
      if (!selectedLog && shouldAutoRefresh(recording, limit, PAGE_SIZE)) {
        return startVisiblePolling(() => fetchLogs(false), { interval: () => Math.max(30, refreshIntervalSec) * 1000, immediate: false });
      }
    }, [recording, fetchLogs, limit, refreshIntervalSec, selectedLog]);`);
  s = once(s, '              min={1}', '              min={30}');
  const section = /    \/\/ Poll for related logs[\s\S]*?\n    \}, \[selectedLog\?\.id, selectedLog\?\.correlationId\]\);/;
  const found = s.match(section); if (!found) throw new Error('Missing related log effect');
  let related = found[0];
  related = once(related, 'const interval = setInterval(async () => {', 'const stopPolling = startVisiblePolling(async () => {');
  related = once(related, 'if (cancelled || !res.ok) return;', 'if (cancelled) return true;\n          if (!res.ok) return false;');
  related = once(related, 'if (!Array.isArray(cidLogs) || cidLogs.length === 0) return;', 'if (!Array.isArray(cidLogs) || cidLogs.length === 0) return true;');
  related = once(related, '        } catch {\n          /* poll failed — non-critical */', '          return true;\n        } catch {\n          return false;');
  related = once(related, '      }, 3000);', '      }, { interval: 30000, immediate: false });');
  related = once(related, 'clearInterval(interval);', 'stopPolling();');
  return once(s, section, () => related);
});
// All anchors must validate before any file is written.
fs.mkdirSync(path.join(root, 'src/shared/utils'), { recursive: true });
for (const { full, modified, file } of changes) { fs.writeFileSync(full, modified); console.log(`Patched ${file}`); }
fs.writeFileSync(path.join(root, 'src/shared/utils/visiblePolling.js'), helper);
console.log('Added src/shared/utils/visiblePolling.js');
