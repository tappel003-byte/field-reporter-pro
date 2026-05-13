## Goal

Reorganize the plan workspace so primary controls anchor to the **left edge** instead of competing for the bottom-center. Free up the right side for the plan content and reduce the number of floating bars.

## Layout changes

```text
Before                              After
┌──────────────────── ⛶ ┐          ┌──[📍 Pin|✏️ Draw]──────── ⋯ ┐
│                       │          │                            │
│       PLAN CANVAS     │          │       PLAN CANVAS          │
│                       │          │                            │
│   [Edit pin (3) ▾]    │          │ [Edit pin (3) ▾]           │
│  ┌─📍─✏️─↶─📤─┐        │          │ ┌─📍─┐                     │
│  └────────────┘       │          │ │ ✏️ │                     │
└───────────────────────┘          │ │ ↶ │                     │
                                    │ └────┘                     │
                                    └────────────────────────────┘
```

### Top
- **Mode pill** `[📍 Pin | ✏️ Draw]` — top-left, segmented control. Tells you what tap-on-plan does.
- **⋯ overflow menu** — top-right. Contains: Fullscreen, Export, (room to grow: Rotate north, Project info, Delete).
- **Remove floating ⛶ button** — it's already duplicated inside the existing menu (`fsMenuItem`), so the floating one is redundant. One less thing covering the plan.

### Bottom-left (vertical "tool rail")
- **Edit pin (N) ▾** chip — only visible in Pin mode with ≥1 pin.
- Below it, a small vertical stack of context tools:
  - **↶ Undo** (always)
  - **✏️ stroke / ⬛ thickness** (Draw mode only)
  - **🗑️ clear last** (optional)
- Anchored bottom-left, ~12px from edges. Vertical orientation keeps the plan's horizontal width clean.

### What goes away
- Floating top-right ⛶ (lives in ⋯ menu).
- Bottom-center horizontal toolbar (replaced by left rail + top mode pill).
- Bottom-center "Edit pin ▾" pill (moves to bottom-left).

## Why left, not right
- User holds device with left hand while sketching/pointing with right → left rail is out of the drawing hand's way.
- Eyes scan left-first; mode indicator at top-left answers "what am I about to do?" before any tap.
- Right edge stays clean for the plan and for any future right-side affordances (scale bar, north arrow legend).

## Tradeoffs / open
- Android gesture nav lives bottom-edge; bottom-left rail sits ~12px up so it doesn't conflict, but worth testing.
- ⋯ menu hides Export one tap deeper — acceptable since export is terminal (once per session).

## Implementation scope (single file)

`public/survey.html`:
1. Restyle `.work-toolbar` from `bottom:14px; left:50%; transform:translateX(-50%); flex-direction:row` → `bottom:14px; left:12px; flex-direction:column`.
2. Add `.mode-pill` segmented control (Pin / Draw) absolutely positioned `top:8px; left:8px`. Wire to existing `ui.mode` state used by tap handler.
3. Replace `.fullscreen-btn` with `.menu-btn` (⋯) at `top:8px; right:8px`; move Export `<button>` into the existing menu list alongside `fsMenuItem`. Delete the standalone `.fullscreen-btn` element.
4. Reposition `#pinPickerBtn` (the "Edit pin ▾" pill) to `bottom:` above the toolbar rail at `left:12px`. Keep its existing show/hide-on-pin-count logic, plus hide it when `ui.mode === 'draw'`.
5. Show/hide draw-only buttons (stroke/thickness) based on `ui.mode`.

No business-logic changes — all existing handlers (`undo()`, `toggleFullscreen()`, `openPinPicker()`, export, mode setters) stay as-is; only their containers and positions change.
