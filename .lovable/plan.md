# UI cleanup v2: floating-everything + sticky header

All changes in `public/survey.html` (frontend only).

## 1. Burst camera — tap = instant capture

- Remove the accept/use confirmation step.
- Each shutter tap: grab frame → save to active pin (or unattached) → flash + haptic tick + increment count.
- "Done" closes the camera; viewfinder stays live between taps.

## 2. Remove "PHOTOS GO TO Unattached" chip

- Delete the chip and its show/hide logic.
- When a pin is active, show a tiny detach `×` next to the floating camera; otherwise hidden.

## 3. Floating, draggable camera button

- Bottom-right default, 16px inset above safe area.
- Persist `state.ui.cameraPos` per project.
- Tap = open burst camera; long-press 200ms = start drag (prevents accidental drag during fast snapping).
- Clamp to viewport on resize/orientation.

## 4. Draw color key = Surface colors

Re-map the 6 draw swatches to the surface palette and labels (Ceiling, Drywall, Floor covering, Other, Separation, Slab/Concrete). Active caption and expandable Key both read surface names. Colors come from the existing `SURFACES` array — single source of truth.

## 5. Float every menu / button

Convert remaining anchored controls into draggable floating panels using the existing `makeDraggable` helper, each with persisted per-project position and the same collapse arrow pattern:

- **Findings counter** → small floating chip (top-left default, below mode switcher).
- **Undo / Redo** → small floating pill (top-right default, below header).
- **Plan upload** → floating button (becomes hidden once a plan is loaded).
- **Overflow `⋯` menu** → already a button in the header; turns into a floating round button anchored top-right by default.
- **Site-photos tray button** → floating, sits next to the camera FAB.
- **Mode switcher, Surfaces, Draw toolbar, Descriptors** — already floating, no change.

Persisted positions added to `state.ui`:
`findingsPos`, `undoPos`, `planPos`, `overflowPos`, `photosTrayPos`, `cameraPos`.

All floating elements:
- 44pt minimum touch target.
- Collapse arrow where the control has more than one element.
- Drag handle = the `::` grip dots, except small single-button floats which long-press to drag.
- Clamp to viewport; double-tap grip to snap back to default.

## 6. Sticky header with weather + address

The Row 1 header becomes a single **sticky** bar (`position: sticky; top: 0; z-index: 50`) containing:

- Pin icon
- Job address (editable, truncates with ellipsis)
- Weather inline chip: `82°F · 7 mph · Clear` + small timestamp, right-aligned next to the address
- `⋯` overflow stays at the far right (and is also draggable per #5; the header keeps a "home" slot if it hasn't been moved)

The current standalone weather card at the bottom of the canvas is removed — its data lives in the header now. SAVED indicator collapses into a small dot on the address bar.

Row 2 (project tools) is also sticky directly under Row 1 so the canvas scrolls beneath both. Both rows together use a translucent backdrop blur so the canvas peeks through.

## 7. Light cleanup

- Adjust default offsets so floating elements don't stack on a 390px viewport.
- Remove now-unused CSS (photo target chip, old weather card, old anchored buttons).

## Out of scope

- Backend / schema changes.
- Symbols library.
- Descriptor panel restructure.

## Technical notes

- Reuse `makeDraggable(el, handle, stateKey)`; extend to accept a `defaultPos` and a `longPressToDrag` option.
- Surface colors via a `surfaceColor(id)` lookup shared by the surfaces palette and draw toolbar.
- Sticky header uses `backdrop-filter: blur(12px)` with a semi-transparent paper-tone background so it works over both blank canvas and uploaded plans.
- Weather string is built from the existing weather fetch; truncate to `82°F · 7mph · Clear` on narrow viewports.
