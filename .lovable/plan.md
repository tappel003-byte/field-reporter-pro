## Plan

I’ll keep this minimal and only touch the two places that explain the current failures.

1. **Fix GPS permission in the app wrapper**
   - Update the home iframe `allow` permission from camera-only to include `geolocation`.
   - This is required for Auto-fill address and Use coordinates to work inside the Lovable preview iframe.

2. **Audit camera click wiring in `survey.html`**
   - Check which buttons are wired to camera/file inputs.
   - Make sure only photo-related buttons open the camera.
   - Confirm Start, Export, Drawing, address, and GPS buttons do not accidentally trigger file capture.

3. **Verify tablet Start visibility without changing unrelated behavior**
   - Confirm the Start button remains visible at the current mobile/tablet viewport.
   - If needed, make the setup footer normal/sticky flow only; no camera or export logic changes.

## Files to inspect/change

- `src/routes/index.tsx` — add `geolocation` to iframe permissions.
- `public/survey.html` — only if the camera trigger audit finds incorrect event wiring.