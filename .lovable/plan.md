## Problem

In `public/survey.html`, the draw toolbar (`.draw-toolbar`) is fixed to the **left edge, vertically centered** as a tall vertical strip (pencil, rect, circle, eraser, thickness, colors). On a phone in landscape the viewport height is only ~390px, so the column is taller than the screen and the bottom tools (colors, eraser) get clipped off the side.

Tablets in landscape have plenty of height, so they're fine. iPad mini portrait and phone portrait both work today.

## Fix

Pure CSS, scoped tightly so it only triggers on phone-sized landscape viewports — nothing changes for portrait phone, iPad mini (portrait or landscape), or desktop.

Add a media query in `public/survey.html` targeting **short landscape screens** (matches phones, not tablets):

```css
@media (orientation: landscape) and (max-height: 480px) {
  .draw-toolbar {
    /* flip from vertical left-strip to horizontal top-strip */
    left: 50%;
    top: 8px;
    transform: translateX(-50%);
    flex-direction: row;
    max-width: calc(100vw - 16px);
    flex-wrap: wrap;
    justify-content: center;
  }
  .draw-toolbar .dt-row { flex-direction: row; }
  .draw-toolbar .dt-sep { width: 1px; height: 28px; margin: 0 2px; }
}
```

Why these thresholds:
- `orientation: landscape` + `max-height: 480px` matches every common phone in landscape (iPhone SE 320h, iPhone 15 Pro 393h, Pro Max 430h) and **excludes** iPad mini landscape (~744h) and any desktop.
- Flipping to a horizontal bar across the top keeps all pens reachable, doesn't overlap the mode pill (which is bottom-anchored), and reuses existing button styles.

## Out of scope

No JS changes, no orientation lock, no behavior change to drawing itself — purely a responsive layout tweak to the existing toolbar.

## Files touched

- `public/survey.html` — add the media query block in the existing `<style>` section near the other `.draw-toolbar` rules (around line 178).
