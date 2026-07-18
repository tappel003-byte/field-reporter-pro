## What I checked on the live published URL

I tested the published site directly, not the Lovable preview:

`https://field-reporter-pro.lovable.app/survey.html`

The check did three things:

1. Requested the live files directly.
2. Opened the live page in a fresh browser session.
3. Asked the browser what service workers are actually registered for that live origin.

### Live result

```text
survey.html status: 200
sw.js status: 200
register-sw.js status: 404
serviceWorker registrations: []
serviceWorker ready: null
caches: []
```

### What that means

The service worker file exists on the live site, but the registration script I added is not available on the published site. Because `/register-sw.js` is returning 404, the page never runs the code that calls `navigator.serviceWorker.register('/sw.js')`.

So you are right: the failure is not whether the build can generate a service worker locally. The live published page is not actually registering it.

## Plan for the next fix

1. Remove the separate `/register-sw.js` file approach because the live published site is not serving it.
2. Put the guarded registration script directly inside `public/survey.html`, so the actual page you open always contains the registration code.
3. Keep the same safety rules:
   - no registration in preview/editor iframe
   - no registration on dev/localhost
   - `?sw=off` disables and clears it
   - `?sw=on` re-enables it
4. Keep `/survey.html` as the offline fallback and manifest start page.
5. After the change, verify against the published URL again using the same live-origin check:

```text
https://field-reporter-pro.lovable.app/survey.html
navigator.serviceWorker.getRegistrations()
navigator.serviceWorker.ready
caches.keys()
```

The fix is not complete until the live published check shows at least one registration for:

```text
https://field-reporter-pro.lovable.app/sw.js
```