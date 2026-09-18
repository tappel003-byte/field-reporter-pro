# Multiple named plans in one survey

Today a survey holds exactly one floor plan. This adds the ability to keep
several named plans (e.g. "Main Floor", "Basement", "North Elevation") inside
the same survey, without changing how a single-plan job feels or behaves.

## How it works for you

- Setup stays the same: upload one plan, name it if you like, start working.
  If you never add a second plan, nothing on screen changes.
- A small plan name appears in the project header. Tapping it opens a short
  list: your plans, plus "➕ Add plan".
- Adding a plan opens the same upload + rooms + front-door setup you already
  know, then drops you onto the new plan.
- Each plan keeps its own pins, drawings, boundaries, rooms and front door.
- Pin numbers keep counting across plans: if Main Floor ends at 12, Basement
  starts at 13. Photo filenames stay unique, one continuous set.
- Renaming or deleting a plan lives in that same list (delete asks first and
  warns if the plan has pins).

## Export

One export for the whole survey, as now:

- `photos/` — unchanged, one continuous numbered set.
- `pins.csv` / `pins.json` — one new `plan` column/field with the plan name.
  Rows stay in pin-number order.
- PDF pin log — one page per plan (plan image with its pins burned in),
  followed by the keyed description list, grouped by plan with a heading.
- Single-plan surveys produce a byte-comparable export to today, with the
  `plan` column carrying the single plan's name.

## Technical notes

All in `public/survey.html`.

**Data shape.** Introduce `project.plans[]`, each entry holding what is today
spread across the project root: `{ id, name, plan:{dataUrl,width,height},
rooms, frontDoor, frontDoorFacing, north, pins, drawings, boundary,
excludedAreas }`. Add `project.activePlanId`. `project.nextNum` and
`project.startNum` stay at project level so numbering is global.

**Migration on load.** In `load()`, any project without `plans` is rewritten
in memory into a single-entry `plans[]` named "Plan 1" (or the address), with
`activePlanId` set to it. Migration is idempotent and runs before any render.

**Compatibility shim.** Rather than rewriting ~60 `project.pins` /
`project.plan` / `project.rooms` call sites, define accessors that proxy to
the active plan — e.g. `Object.defineProperty(project, 'pins', {...})` applied
in one `bindActivePlan(project)` helper called at load, after setup save, and
on plan switch. Rendering, hit-testing, pin sheet, room logic, undo snapshot
(`snapshot()` / `restore()`) then need no changes.

**Numbering.** `renumberPins()` currently walks `project.pins` and reassigns
from `startNum`; change it to walk all plans in plan order, then pin order, so
the global sequence stays gap-free after deletions.

**Setup screen.** `openSetup()` / setup save gain an optional `planId` arg. New
plan = same screen with an empty `_setupPlan`, saving pushes a new entry
instead of mutating the existing one. Add a plan-name text field (defaults to
"Plan 2", "Plan 3", …).

**Export.** `composeMapImage()` and `buildPinLogPdf()` take a plan argument and
are called once per plan; the ZIP writer loops plans for CSV/JSON rows and
photo writing, keeping the existing photo-resolution and skip logic untouched.

**Untouched.** Capture flow, camera input attributes, service worker /offline
code, Quick Capture, voice memos, trash, and backups.
