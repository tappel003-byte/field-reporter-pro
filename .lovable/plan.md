# Fix: "Safari can't open the page because the network connection was lost"

## What happened

The screenshot is a Safari tab on `field-reporter-pro.lovable.app` (the root `/`, not `/survey.html`), showing Safari's own network-error page even though you had full signal.

That message appears when the page's service worker answers a navigation with a failed response instead of real content. The current worker does exactly that: when its network-first fetch doesn't complete, it looks for a cached copy of `/survey.html` or `/`, and if neither is in the cache it returns `Response.error()` — which Safari renders as "network connection was lost."

Two things make that likely on iOS after the app has been backgrounded:
- iOS suspends and later kills the service worker; the resumed navigation can fail its fetch even with a good connection.
- Only `/survey.html` is guaranteed to be pre-cached as an offline shell. A navigation to bare `/` can miss the cache entirely and fall through to the error response.

## The fix

1. Never return a bare network error for a page navigation. Replace `Response.error()` with a small built-in offline page (plain HTML, no dependencies) that says the app couldn't load and offers a Retry button plus an "Open Survey" link. Your data is untouched either way — this only affects what you see instead of Safari's error screen.
2. Cache both entry points as offline shells at install and activate: `/survey.html` and `/`, so a navigation to either always has something to serve.
3. Make the root path resilient: if a navigation to `/` fails and no cached `/` exists, serve the cached `/survey.html` shell rather than failing.
4. Raise the network-first timeout from 3s to about 8s for navigations, so a slow-but-working mobile connection resolves normally instead of dropping into the fallback path.
5. Add a one-time cache-version bump so the corrected worker replaces the current one on installed and browser copies.

## Technical notes

All changes are in `src/sw.ts`:
- `setCatchHandler`: add `caches.match` against the precache for `/` before falling back; final return becomes a generated `Response` with `Content-Type: text/html` and status 200 rather than `Response.error()`.
- `cacheOfflineShell()`: fetch and store both `/survey.html` and `/` into `OFFLINE_CACHE`; bump `OFFLINE_CACHE` to `offline-shell-v2` and `RESET_CACHE` to `sw-reset-fr-v4`.
- Navigation `NetworkFirst`: `networkTimeoutSeconds: 8`.

No changes to `public/survey.html`, project data, or storage.

## Verification

After publishing: close the tab and the installed app fully, reopen once while online (this lets the new worker install), then background the app for a while and return. The failure mode should be either the app loading normally or the in-app offline page with a Retry button — never Safari's network error.
