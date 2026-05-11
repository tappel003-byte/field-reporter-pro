## Issues

1. **Auto-fill address / Use coordinates don't pull data.** The buttons call `navigator.geolocation.getCurrentPosition` and reverse-geocode via Nominatim. In the Lovable preview iframe, geolocation is blocked unless the iframe has `allow="geolocation"`, so the call silently fails or times out and the hint may not be obvious. On the published site, Nominatim can also fail without a clear message.
2. **No Start Survey button on tablet.** The button lives in `.setup-foot` which is `position: fixed; bottom: 0`. Inside the preview iframe on tablet (and in some PWA/safe-area cases) this fixed bar can render outside the visible area, so the button appears missing.

## Plan

Edit `public/survey.html` only.

1. Make the Start button always visible regardless of viewport:
   - Change `.setup-foot` from `position: fixed` to a normal flow element at the end of `#screenSetup` (or `position: sticky; bottom: 0`) so it's always anchored to the bottom of the scrollable setup column on phone, tablet, and desktop.
   - Keep the bottom safe-area padding so iOS home indicator doesn't overlap it.
   - Remove the 100px bottom padding on `.setup-body` that was compensating for the old fixed bar.

2. Improve the GPS flow so the user gets a clear result every time:
   - Show the `#gpsHint` message in all branches (success, denial, timeout, no-https, no-geolocation API) with plain wording: e.g. "Location blocked in this preview — open in a new tab or type the address."
   - Add a 12s watchdog: if `getCurrentPosition` neither resolves nor errors (common in iframes), surface a fallback message and re-enable the button.
   - Wrap the Nominatim `fetch` in a 10s `AbortController` timeout. On failure, fall back to filling the input with `lat, lon` and tell the user.
   - After any GPS attempt, always re-enable the button and restore its label.

3. Keep manual typing fully functional (no change to the address input itself); the three options remain: type, Auto-fill, Use coordinates.

4. Verify by loading the survey page in the preview at tablet width and confirming the Start button is visible at the bottom of the setup screen, and that the GPS buttons either return a value or show a clear hint.

## Technical notes

- `.setup-foot` rule lives near line 93; `.setup-body` padding at line 73.
- GPS handlers: `useGpsForAddress` (≈546) and `useGpsCoordsOnly` (≈603). Both already call `validateSetup()` and update `startBtn` — that logic stays; only error/timeout paths and hint visibility are hardened.
- No business-logic or data-model changes; this is presentation + UX hardening.
