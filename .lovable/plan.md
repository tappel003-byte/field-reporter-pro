# Recover the app from its stuck offline worker

## What happened, simply

There are two copies of the app: the published website and a hidden offline copy stored by Safari. Reverting restored the website, but browsers do not remove an already-installed service worker when website code is reverted.

The live published site currently serves the older `sw-reset-fr-v2` worker. It controls the entire site. Its navigation fallback returns `Response.error()` when neither `/survey.html` nor `/` is available in its cache. Safari presents that worker-generated failure as “the network connection was lost,” even when the phone has a full signal.

The recent forced-reload removal addressed the freezing behavior, but it could not remove the older worker already stored on the phone. Adding more fallback logic to that worker would be another patch on unstable browser-held state, so that is no longer the proposed approach.

## Recovery release

1. Replace `/sw.js` for one published release with a small cleanup worker at the same URL. Returning phones will receive it automatically.
2. Have that worker delete only this app’s Workbox/offline caches, take control, refresh open app pages once, and unregister itself even if cleanup partly fails.
3. Remove the existing registration/update code during this recovery release so it cannot immediately install another worker.
4. Keep the manifest and home-screen icon. This cleanup does not delete survey projects, photos, IndexedDB, or localStorage.
5. Confirm the regular published website and `/survey.html` open normally after the worker has removed itself.

## After recovery is confirmed

Offline cold-start support will be rebuilt separately using the standard generated-worker setup, with registration disabled in previews and embedded frames. Separating cleanup from rebuilding avoids making the stuck state harder to diagnose.

## What this means for you

- The app is recoverable.
- Your full signal was real; the message came from Safari’s stored worker, not the cellular connection.
- Reverting did not fail—it restored the files, but browser-held offline state survives a revert.
- During the cleanup release, the app requires a connection. Home-screen support remains, but offline opening returns only after the clean rebuild.

## Verification

After publishing the recovery release: open the published app once while online, allow the cleanup refresh, fully close Safari/the home-screen app, and reopen it. Verify both a new survey and an existing job respond normally. Then test a second reopen to confirm the stale worker does not return.
