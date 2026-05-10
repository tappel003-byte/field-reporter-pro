# Fullscreen toggle

All work in `public/survey.html` (frontend only).

## 1. Floating fullscreen button

- New small round floating button, top-right corner by default, 16px inset from edges, 44pt touch target.
- Icon swaps based on state: `⛶` when normal, `⛶` (or `⤡`/`⤢`) when in fullscreen — final icon TBD during build; keep it iconographic so it reads on a tablet.
- Tap toggles fullscreen on `document.documentElement`.
- Long-press 200ms = drag (same pattern as the camera FAB); persists position per project in `state.ui.fullscreenPos`.
- Hidden automatically if the Fullscreen API is unavailable (e.g. iOS Safari on iPhone — iPad supports it).

## 2. Overflow `⋯` menu entry

- Add a `Fullscreen` / `Exit fullscreen` row at the top of the existing `toolsMenu` popup.
- Label updates live based on `document.fullscreenElement`.

## 3. Wiring

- Single helper `toggleFullscreen()` used by both entry points.
- Listen to `fullscreenchange` (+ webkit prefix) to:
  - Update both button icon and menu label.
  - Reclamp all floating panels to the new viewport (fullscreen on a tablet changes available height).
- Exit on Esc handled by the browser; no extra code.

## 4. Out of scope

- No in-app immersive mode (header/tools stay where they are — true browser fullscreen only, per your choice).
- No keyboard shortcut.
- No persistence of fullscreen state across reloads (browsers require a user gesture, so we can't auto-enter).

## Technical notes

- Use `el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.()` and matching exit calls for Safari compatibility.
- Feature-detect with `document.fullscreenEnabled || document.webkitFullscreenEnabled` to decide whether to render the button / menu row.
- Reuse `makeDraggable(el, handle, 'fullscreenPos')` with the long-press-to-drag option already used by the camera FAB.
- On `fullscreenchange`, call the existing clamp logic (the same one `makeDraggable` uses on resize) so floating panels don't end up off-screen after entering/exiting fullscreen.
