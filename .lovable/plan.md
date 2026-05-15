## Goal

Bring the same annotation box you just locked in on photos to the floor plan view. The "T" button already exists on the plan toolbar — today it pops a basic `window.prompt()` and drops plain text on the plan with no box, no sizes, no resize, and only basic drag. We'll replace that with the polished boxed version.

## What you'll get on the plan

- Tap **T** then tap the plan → modal editor opens (same one as photos)
- Pick **size** (large title / small annotation), type text, save
- White box with black text appears at the tap point
- **Drag** to move
- **Pinch a corner handle** to resize the box (text rewraps inside)
- **Tap an existing box** with T active → reopens the editor for that box
- Eraser tool removes it just like other shapes

Same look, same feel, same two text sizes — just on the plan instead of a photo.

## How it'll work under the hood

- Reuse the existing photo-viewer text editor modal (`.txed`) — it's already built and styled
- Extend the plan's `kind: 'text'` drawing to also store `{ size: 'lg'|'sm', w, h }` like photo annotations do
- Reuse the box geometry helper (around line 2257 — "Photo text-box geometry helper") so wrap/box math is identical
- Render path: when drawing the plan overlay, if `kind === 'text'` and it has the new fields, draw the white box + wrapped text exactly like the photo viewer does
- Pointer logic on the plan: hit-test the box rect (not just a point) so drag picks it up anywhere on the box, and add a corner-handle hit-test for resize
- Backward compat: old text drawings without `size`/`w`/`h` keep rendering as plain text — no data migration needed

## Out of scope

- No changes to photo annotations
- No new toolbar buttons — reusing the existing **T**
- No PDF export changes (it'll pick up the new rendering automatically since it draws from the same data)

## Open question before I build

When the plan view is zoomed/panned, should the text box scale with the plan (so it stays "pinned" at a real size on the floor plan, like the other shapes), or stay a constant on-screen size (like a UI label)? The photo viewer scales it with the image — I'd default to the same behavior here unless you'd rather it stay constant.