## Problem

The previous change shrank text in the shared `boxGeom` helper, which is used by both photo annotations and plan annotations. That unintentionally shrank photo text too. Photos should go back to their original sizing; only the plan should render smaller.

## Fix

Make the size calculation context-aware so photo annotations are unchanged and plan annotations stay smaller.

- Add an optional `context` parameter to the box geometry helper (`'photo'` default, `'plan'` for the plan view).
- Photo path keeps the original multipliers: `Math.max(baseSw * (lg ? 7 : 4), lg ? 20 : 11)`.
- Plan path uses the reduced multipliers: `Math.max(baseSw * (lg ? 4 : 2.6), lg ? 14 : 9)`.
- Update the plan render + hit-test call sites to pass `'plan'`; photo call sites stay as-is (default).

## Out of scope

- No changes to drag/resize, modal editor, pinch handling, or PDF export logic — those already read whatever the geom helper returns.
- No data migration; existing annotations re-render with the correct sizing automatically.

## Open question

Does the current plan-view text size feel right to you, or do you want it a bit bigger / smaller before I lock it in? I'll use whatever you've got on screen now as the baseline unless you say otherwise.
