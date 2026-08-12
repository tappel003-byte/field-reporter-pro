# Make the camera behave exactly like PGG

## What I found

I compared this app to PGG Field Assessment side by side.

PGG's photo input is:

```text
<input id="pinPhotoFile" accept="image/*" capture="environment" multiple ...>
```

This app currently has the same input **minus `multiple`** — I removed it last time on the theory that iOS ignores `capture` when `multiple` is present. PGG proves that theory wrong: it keeps `multiple` and still opens the camera directly.

The other real difference: PGG shipped a one-release service-worker reset (it wipes all offline caches, reloads open tabs, then unregisters itself) and bumped its install `start_url` to `/survey.html?pwa=pgg-v6`. This app has neither. Its installed home-screen copy can keep serving an older cached page, which is the most likely reason the fix "didn't work" on your phone even after the file changed.

## The change

1. Restore the Add input to PGG's exact form — put `multiple` back alongside `capture="environment"`.
2. Add a one-release cache reset so the installed app is guaranteed to load the new page: bump the manifest `start_url`/`id` to `/survey.html?pwa=fr-v2`, and clear stale offline caches on the next launch.

After this, on your phone: fully close the app, reopen it once (online) so the reset runs, then reopen again. Add should go straight to the camera.

## Technical detail

- `public/survey.html` line 829: restore to `accept="image/*" capture="environment" multiple`.
- `public/manifest.webmanifest`: add `"id": "/survey.html?pwa=fr-v2"` and set `start_url` to the same.
- `src/sw.ts`: on `activate`, delete existing cache keys once (guarded by a version constant) and `clients.claim()` before resuming the normal NetworkFirst/CacheFirst routing — keep the offline shell behaviour otherwise intact.
