# Restore offline loading, safely

## What happened

Offline loading was removed as an emergency fix, not as a design change. The stored offline copy on your device was serving an old version of the app and ignoring your reverts, which is why the app froze on the Setup screen and inside existing jobs.

Right now:

- `public/sw.js` is a one-time cleanup file. When the app is opened once with signal, it deletes the stuck stored copy and removes itself.
- No code anywhere re-installs an offline copy.
- Surveys, photos, dictation, and trash are untouched — none of this involves your data.

What you lose until offline is restored: the app needs signal to open from fully closed. Once open, everything works with no signal.

## Why it has to be two steps

If a new offline copy ships in the same release as the cleanup, the browser can grab the broken one again and you are back where you started. The cleanup needs one release on its own.

## Step 1 — Publish the cleanup (now)

No code changes. Publish, then on the device:

1. Open the app once with signal.
2. Fully close it.
3. Reopen it.

Expected result: Setup screen and existing jobs are responsive again.

## Step 2 — Put offline back (next release, after you confirm Step 1 worked)

Rebuild offline loading the correct way instead of the hand-written version that caused the jam:

- Use the standard generated offline setup rather than a hand-maintained file.
- Page loads always try the network first and fall back to the stored copy only when there is no signal. This is the key change — the old version preferred the stored copy, which is exactly how it got stuck on an old page.
- Only fingerprinted build files are stored aggressively; those change name every release so they can never go stale.
- No forced reloads of open windows on update. That was the other half of the freeze.
- An `?sw=off` escape hatch so a stuck copy can always be cleared without waiting on a release.

## Technical notes

- Step 2 uses `vite-plugin-pwa` with `generateSW`, `registerType: "autoUpdate"`, `injectRegister: null`, and `devOptions.enabled: false`.
- Registration happens from a single guarded wrapper that refuses to register in dev, in an iframe, on Lovable preview hostnames, or when `?sw=off` is present, and unregisters any matching worker in those cases.
- Navigation requests use `NetworkFirst`; same-origin hashed assets use `CacheFirst`. `/~oauth` is excluded from navigation fallback.
- The cleanup worker at `public/sw.js` is replaced by the generated worker at the same path in Step 2.
- Offline behavior is only testable on the published app, not in the editor preview.
