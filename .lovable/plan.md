## Plan

I checked the current PWA setup. The likely issue is that the app is being cached around `/`, but the real field app lives inside `/survey.html`. On iPhone Safari, reopening the site from the address bar can fail before the cached app shell gets a chance to redirect/render that iframe path.

### What I will change
1. Keep the service worker guarded so it still does **not** run in Lovable preview, dev, or editor iframe.
2. Change the install/start path to `/survey.html` so the phone opens the actual Distress Survey page directly.
3. Update the offline fallback so `/survey.html` is the document Safari can serve when there is no internet.
4. Keep the kill switch: `?sw=off` disables and clears the app-shell service worker; `?sw=on` re-enables it.
5. Do not touch survey data, IndexedDB, localStorage, pins, photos, UI, or the survey model.

### Technical notes
- Update `manifest.webmanifest` `start_url` from `/` to `/survey.html`.
- Update the PWA `navigateFallback` from `/` to `/survey.html`.
- Keep `NetworkFirst` for HTML navigations and cache-first only for built/static app-shell files.
- Leave the registration wrapper in one place, with preview guards intact.

### After publishing, test this way
1. On iPhone, turn Wi-Fi/cell back on.
2. Open `https://field-reporter-pro.lovable.app/survey.html` once and let it fully load.
3. Refresh that same page once while still online.
4. Add it to Home Screen again if you use the icon, because iPhone may keep the old start path.
5. Fully close Safari/the Home Screen app.
6. Turn on Airplane Mode.
7. Reopen from the Home Screen icon or the same `/survey.html` bookmark.
8. Confirm the app opens, then start a new pin, take a photo, enter/save a description, and confirm it remains in the project offline.