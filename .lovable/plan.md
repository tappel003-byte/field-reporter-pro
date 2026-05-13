## Problems

1. The "📍 Edit pin ▾ (4 pins · 8 pics)" pill is not visible in the lower-left of the floor plan, even though the header subtitle correctly reads `INTERNAL · 4 PINS · 8 PICS` (so `refreshSubtitle()` did run).
2. Tapping the floor plan to drop a pin no longer opens the pin description / photo sheet.

Both regressed during the recent pinch-zoom rewrite. I want to fix them deterministically — not patch and hope.

## Investigation

### Pin pill (#pinPickerBtn)

The button exists in markup at line 372 with `position:absolute; bottom:14px; left:12px; z-index:5` inside `#stage` (`overflow:hidden`). `refreshSubtitle()` enables it and removes `.hidden` whenever pins exist. The most likely real causes (to verify in the live DOM via browser tools, with a project loaded):

- The button is rendered but obscured / clipped because `applyTransform()` or `setViewAnchored()` is now mutating something on the stage (e.g., a stray `transform` on `#stage` itself instead of `#planSvg`) that pushes children offscreen.
- Or the button's CSS `var(--paper)` background resolves to a color matching the dark stage background under some condition (it shouldn't — paper is the cream).
- Or `_pointers` capture / pointer-events from the new pinch handler is putting an invisible overlay on top.

### Pin sheet on drop

In `onPointerUp` (line 1220), `_maybeTap.moved` blocks the sheet. With the new pinch math, any small movement during a single-finger tap could be flagging `moved=true`. Two suspects:

- The 8-pixel threshold at line 1187 is fine, but `ui.panning` is now also being touched in `onPointerDown` for pinch; if a pinch ends with one finger lifted first, the remaining single-pointer path may inherit stale `_maybeTap` state and never reach `openPinSheet`.
- More likely: `setViewAnchored()` or `applyTransform()` is throwing silently on the very first move event, and the catch path leaves `_maybeTap.moved = true` without ever reaching the up handler in a clean state.

## Fix

1. **Re-test the live preview with a real project loaded.** Use the browser tool to navigate to `/survey.html`, create a project, drop a pin, and inspect:
   - Computed style + bounding rect of `#pinPickerBtn` (is it 0×0? offscreen? `display:none`? behind another element via `elementFromPoint`?).
   - Console errors during pinch / tap.
   - State of `_maybeTap`, `_pointers`, `ui.panning` after a tap that should have opened the sheet.

2. **Pin pill** — based on what the inspection shows, the targeted fix is one of:
   - Restore correct stacking: bump `#pinPickerBtn` to `z-index:6` (matching `.mode-pill`) and ensure no transform is applied to `#stage`.
   - Remove any leftover `.hidden` class added by an earlier patch.
   - If `#planSvg` is now overlaying the button due to width/height changes, set `#planSvg { pointer-events:auto; z-index:0 }` and `#pinPickerBtn { z-index:6 }` explicitly.

3. **Pin drop sheet** — make tap detection robust:
   - In `onPointerDown`, when a single pointer goes down, reset `_maybeTap.moved = false` explicitly.
   - In `onPointerMove`, only set `moved = true` if there's actually a single active pointer (`_pointers.size === 1`) — pinch midpoint jitter must not poison a tap.
   - In `onPointerUp`, if the released pointer is the last one and `_maybeTap` exists with `!moved`, open the pin sheet even if `ui.panning` was touched.
   - Wrap `setViewAnchored` / `applyTransform` calls in try/catch so a math hiccup can't strand `_maybeTap` in a half state.

4. **Verify** with the browser tool: drop a pin → sheet must appear; pinch-zoom → floor plan stays put; pill visible bottom-left and counts read "(N pins · M pics)".

## Scope

Only `public/survey.html`. No other files touched. No business logic changes.
