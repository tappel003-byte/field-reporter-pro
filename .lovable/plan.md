# Survey UI Redesign — Two Modes, Floating Palettes

Frontend-only changes in `public/survey.html`. No backend, no schema changes.

## Header — two rows

**Row 1 (identity):**
- Back arrow (left)
- Job address headline, auto-filled from GPS, editable inline. Truncates with ellipsis on narrow screens; tap to expand/edit.
- `⋯` overflow menu (upper right): Rename, Duplicate, Export, Settings, Trash, Sign out.

**Row 2 (project tools):**
- Undo / Redo
- Burst camera (site photos)
- Site photos tray button

The mode switch is NOT in the header — it floats (see below).

## Floating Pin/Draw switcher

- **Top-left floating pill**, draggable, position remembered per project.
- Two segments: **Pin** | **Draw**. Exactly one active. Active segment is filled, inactive is outlined.
- Tapping the inactive segment swaps modes and swaps which floating palette is visible.

## Pin mode

- **Floating Surfaces palette** appears (hidden in Draw mode).
  - Six surfaces: Wall, Ceiling, Floor, Separation/Gap, Slab crack, Other. Color dot + label.
  - Draggable; position remembered per project.
  - Stays visible the entire time you're in Pin mode — does not auto-close when the descriptor panel opens.
  - Tapping a surface sets the active surface for the *next* pin (and updates the current open pin live if its descriptor panel is open).
- **Tap canvas** → pin drops with active surface → descriptor panel opens (bottom sheet).
- **Long-press canvas** → pin drops pre-filled with previous pin's category, material, descriptors.
- **Drag** = pan, **pinch** = zoom.

### Descriptor panel

Order: Category (from rail) → Material → Severity slider → Voice note → Photo → Done.

Header of panel:
- Left: small **trash icon** — discards this pin.
- Right: large **green checkmark "Done"** — saves and closes.

On Done: brief haptic tick, panel slides down, pin stays on canvas. No toast.

The panel can be dismissed only via checkmark or trash — no swipe-to-dismiss (avoids accidental discard).

## Draw mode

- Surfaces palette is hidden.
- **Floating Draw toolbar** appears (bottom-center, draggable, position remembered per project):
  - Tools: Free / Line / Ellipse / Eraser
  - Colors: 6 swatches
  - Stroke weight: 3 sizes
  - Clear all (with confirm)
  - Symbols slot (disabled/"coming soon" placeholder for future arrows, hatching, doors, windows, dimensions)
- Tap-and-drag draws on the **draw layer**.
- **Pins remain visible** (read-only) so you can sketch context around them.
- Tapping a pin in Draw mode → small floating tooltip near the pin: **"Edit pin →"**. Tap the tooltip to switch to Pin mode and open that pin's descriptor panel. Tap pin again or tap elsewhere to dismiss tooltip without switching.

## Layers concept (rendering)

- **Pin layer**: pins, severity badges, surface tags. Edited only in Pin mode.
- **Draw layer**: freeform strokes and (later) symbols. Edited only in Draw mode.
- Both layers always render on the canvas. Mode controls editability, not visibility.

## State additions (frontend only, persisted in existing project record)

- `mode: 'pin' | 'draw'` (per project)
- `ui.modeSwitcherPos: {x, y}` (per project)
- `ui.surfacesPalettePos: {x, y}` (per project)
- `ui.drawToolbarPos: {x, y}` (per project)
- `drawStrokes: [...]` already exists or extends current draw data on the project

## What goes away

- The current single combined tool selector (replaced by mode-specific floating palettes).
- The crowded single-row top bar (replaced by two rows + floating switcher).
- "Surfaces hidden until pin drops" behavior (surfaces are always visible in Pin mode now).

## Out of scope (future)

- Symbols library content (slot only, disabled).
- Layer reordering / lock UI (single fixed stacking for now).
- Mode-switcher onboarding tooltip on first run (can add later if needed).

## Technical notes

- All work in `public/survey.html`. Three new draggable floating containers share a small drag helper (pointer events, clamp to viewport, persist on pointerup).
- Mode swap is a single state setter that toggles which palette element has `hidden` and which canvas pointer handler is bound.
- Descriptor panel header gets the trash icon (left) and an enlarged green checkmark (right). Existing close logic re-wired to checkmark; trash calls existing delete-pin path.
- Edit-pin tooltip in Draw mode: lightweight absolutely-positioned div anchored to pin screen coords, dismissed on next tap or mode change.
- Haptic tick uses existing `navigator.vibrate(10)` pattern if present.
