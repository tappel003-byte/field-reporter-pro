# Why this device still fails offline intermittently

Assessment only — no code changes proposed yet. You're right that the shared offline code matches visual-surveyor. The difference is in the *edges around* that shared code in this project, plus leftovers from the recovery release.

## Most likely primary cause: the start_url query string

`public/manifest.webmanifest` uses `start_url` / `id` = `/survey.html?pwa=fr-v2` (added during the earlier cache-reset work; visual-surveyor almost certainly doesn't have this).

What that does offline:

- The precache list (`vite.config.ts`) contains `/` and `/survey.html` — no query string. Workbox precache matching is exact except for a small default ignore-list (`utm_*`, `fbclid`), so `/survey.html?pwa=fr-v2` is **not** a precache hit.
- It therefore falls through to the `NetworkFirst` navigation route. Offline, the network leg fails and it looks in the `html-navigations` runtime cache — under the key `/survey.html?pwa=fr-v2`, which only exists if the app was launched *from the home-screen icon while online* since the current worker installed.
- If that miss happens, `setCatchHandler` in `src/sw.ts` tries `cache.match("/survey.html")` then `"/"` in `html-navigations` only — it never consults the precache. Those keys only exist if you had previously visited plain `/survey.html` online in that same context.

That produces exactly your symptom set: works sometimes, blank sometimes, and "works after closing and reopening" (a reopen that happens to hit a warm runtime-cache entry, or a moment with a sliver of connectivity).

## Answers to your two questions

### 1. Can the `?sw=off` / `?sw=on` cycle leave old Cache Storage behind on iOS?

Yes, in three concrete ways here:

- **Name filter is too narrow.** The purge only deletes caches matching `^(workbox-|html-navigations$|app-shell-assets$|cdn-libs$|html-shell$)`. Any cache created by the original hand-written worker or the interim cleanup worker under a different name (for example a `sw-reset-fr-v*`-style bucket) does not match and survives every `?sw=off`.
- **Unregister is name-scoped too.** It only unregisters registrations whose `scriptURL` ends in `/sw.js`. Anything ever registered at a different path (e.g. `/service-worker.js`) is untouched.
- **iOS context split.** The kill flag lives in `localStorage` under `lovable:sw:killed`, and on iOS the Safari tab and the installed home-screen app have historically not shared the same storage/SW view reliably. Running `?sw=off` in Safari can therefore clean the Safari copy while the home-screen app keeps its own registration and caches. Also, the purge only runs when `survey.html` actually loads — if the app is offline and blank, the cleanup code never executes.

### 2. Can the recovery release leave a half-migrated state?

Yes. Two mechanisms:

- **`revision: null` precache entries.** `/` and `/survey.html` are injected with `revision: null`, which tells Workbox they are self-versioned and must never be refetched. Once a device precached those two HTML files, later republishes do not replace them. So a phone can be running current JS/CSS chunks against an HTML shell frozen at the recovery release — a genuinely half-migrated state that republishing cannot fix.
- **`/` is the React shell, not the survey app.** The catch-handler's second fallback serves `/`, which is the TanStack root route, not `survey.html`. If that's what gets served offline, you get a page that isn't the app — reads as "blank screen."

Additionally, iOS evicts Cache Storage and service workers for sites unused for roughly seven days, and evicts under storage pressure — this app stores photos in IndexedDB, so pressure is realistic. Post-eviction the next cold offline start has nothing to serve.

## What I'd verify before changing anything

1. On the device, launch from the home-screen icon while online, then go offline and cold-start — versus opening `/survey.html` (no query) in Safari online, then offline. If plain `/survey.html` survives offline and the icon does not, the `start_url` query string is confirmed as the cause.
2. Compare `visual-surveyor`'s manifest `start_url` and its catch-handler fallback keys against this one — I expect the query string is the only real divergence.

## If you want a fix later (not doing it now)

Three small, independent changes: drop the `?pwa=fr-v2` from `start_url`/`id` (or make the SW ignore that parameter), give the two HTML precache entries real revisions so republishes actually replace them, and widen the purge pattern plus unregister *all* same-origin registrations rather than only `/sw.js`.
