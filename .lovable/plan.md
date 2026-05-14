## Shrink floor-plan text annotations

Looking at your screenshot ("I wonder how this is going to work"), the text is overlapping the pin and dominating the plan. Photo-viewer text sizing is fine — only floor-plan text needs trimming.

### Change

In `public/survey.html`, reduce the floor-plan text size multipliers by ~30%:

- Thick 3 (large):  `0.07` → `0.05`
- Thick 2 (medium): `0.05` → `0.035`
- Thick 1 (small):  `0.035` → `0.024`
- Minimum floor:    `24px` → `18px`

Apply in three spots that must stay in sync:
1. Line 2606 — SVG render
2. Line 2663 — hit-test fallback
3. Line 2785 — PDF export render (currently `0.04 / 0.028 / 0.02` min `12` — shrink proportionally to `0.028 / 0.02 / 0.014`, min `10`)

Net effect: medium (default) text on a typical plan goes from ~5% to ~3.5% of the plan's longest side — readable but no longer covering pins. Users who want bigger text can still tap the thick-3 swatch.

### Out of scope

- Photo-viewer text sizes (unchanged — those looked right)
- Wrapping logic, color, font family
- Adding a free-form size slider