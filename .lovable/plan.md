## Goal

Tap a photo thumbnail in the pin dialog → opens full-screen viewer. Inside the viewer, optionally annotate the photo with the existing drawing toolbar. Annotations are stored as editable data and re-openable forever; exports show the flattened composite.

## Scope

`public/survey.html` only. No new files, no new dependencies.

## What gets built

### 1. Full-screen photo viewer

- Tap any thumbnail in the pin dialog → opens an overlay covering the screen
- Black backdrop, photo centered and fit-to-screen
- **Swipe left/right** to move between photos in the current pin
- **Pinch-to-zoom + pan** on the photo (reuse the gesture pattern already used on the floor plan canvas)
- Top bar: `X` close, photo counter (`3 / 7`), delete button (trash icon)
- Tap-X or swipe-down to close
- Delete prompts confirm, then removes the photo and either advances to the next or closes if it was the last

### 2. Annotate mode inside the viewer

- An **Annotate** button in the viewer top bar
- Tapping it docks the existing drawing toolbar (pencil/rect/circle/eraser, 5 colors, 3 thicknesses) to the photo
- All strokes draw onto a canvas overlay sized to the photo's natural dimensions (so they stay registered when zoomed)
- **Undo** works during the session (reuse existing snapshot system)
- **Save** commits the current strokes to the photo's data
- **Cancel** discards changes since the annotate session opened

### 3. Persistent, editable annotations

- Each photo gets an optional `strokes` array stored alongside it (same shape as floor-plan strokes)
- Stored in IndexedDB next to the photo blob, keyed off the photo id
- Re-opening an already-annotated photo loads its strokes back into the canvas — fully editable: add, undo, erase, change colors, save again
- The original photo is never modified

### 4. Composite at render time

- Thumbnail in the pin dialog: render photo + strokes flattened (so you can see at a glance which are marked)
- Full-screen viewer: render photo + strokes (interactive in annotate mode, static otherwise)
- ZIP/PDF export: photos exported with strokes burned into the JPEG, same filename pattern as today

### 5. Annotation indicator on thumbnails

- Small dot (or pencil icon) badge in the corner of any thumbnail that has strokes
- Glance-test: which shots did I mark up?

## Technical notes

- **Drawing engine reuse:** the existing stroke renderer that draws on the floor plan canvas is reused as-is; only the target canvas changes (photo overlay instead of plan).
- **Stroke coordinate space:** strokes are stored in the photo's natural pixel coordinates (e.g. 1600×1200), not screen coordinates. This way zoom/pan in the viewer doesn't distort them, and the export composite is pixel-perfect.
- **Storage:** extend the IDB record from `Blob` to `{ blob, strokes? }`. Migration: any existing photo without a strokes field is treated as `strokes: []`.
- **Composite for export:** at export time, draw photo to an offscreen canvas at natural size, then replay strokes on top, then `canvas.toBlob('image/jpeg', 0.9)`. Same path as today, with a stroke pass added.
- **Composite for thumbnails:** same composite logic but rendered to a small canvas; cached so we don't re-flatten on every render.
- **Gestures:** swipe between photos uses a simple touch-move x-delta threshold; pinch-zoom on the photo reuses the existing pinch handler from the plan canvas.

## Out of scope

- Photo brightness/contrast adjustment
- Text annotations on photos (text tool)
- Per-stroke layer visibility toggle
- Annotating from outside the viewer (e.g. annotating from the pin list)
- Animated transitions between photos (just snap)

## Field-test impact

Ships before Saturday is realistic but tight. If anything slips, the order to cut is: (5) annotation badges → (4) burned-in export → (2 + 3) annotate mode. The viewer itself (1) is the highest-value standalone piece and ships first.
