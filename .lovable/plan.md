# Multiple Floors in One Survey

Today a survey holds exactly one floor plan. This adds floors as sheets inside
a single project, so a basement / 1st / 2nd floor house is one job, not three.

## How it works

- Setup stays the same for the first plan. It becomes "Floor 1" automatically.
- In the work screen header, a floor selector shows the current floor
  (e.g. "Basement"). Tapping it lists the floors plus "+ Add floor".
- Adding a floor opens the same setup flow: upload plan image, name the floor,
  set front door / rooms for that plan.
- Each floor keeps its own plan image, pins, drawings, rooms, front-door
  marker, and north rotation. Switching floors swaps the whole canvas.
- Floors can be renamed, reordered, and deleted (delete asks for confirmation
  and warns if the floor has pins).

## Pin and photo numbering

Pin numbers restart at 1 on every floor, as chosen.

To keep photo filenames unique across the export, each floor gets its own
folder in the ZIP:

```text
basement/photo-01.jpg
basement/photo-02.jpg
first-floor/photo-01.jpg
second-floor/photo-01.jpg
```

`pins.csv` gains a `Floor` column as the first column, and rows are grouped by
floor then pin number. Quick Capture and voice memos stay where they are
today (project-level folders) since they are not tied to a plan.

## Export

The PDF becomes multi-page: for each floor, a plan page with its pins burned
in followed by that floor's pin log. Floor name appears in the page header
next to the address.

ZIP export contains one PDF for the whole project, per-floor photo folders,
and the combined `pins.csv`.

## Technical notes

- New `project.floors[]`, each entry `{ id, name, plan, pins, drawings, rooms,
  frontDoor, frontDoorFacing, north, nextNum, startNum }`, plus
  `project.activeFloorId`.
- To avoid touching the ~200 existing `project.plan` / `project.pins` /
  `project.drawings` references, floor switching hydrates the active floor onto
  those same `project.*` fields and writes them back before switching away.
  Existing rendering, pin, drawing, room and FD code keeps working unchanged.
- Migration on load: any project without `floors` gets a single floor built
  from its current `plan/pins/drawings/rooms/frontDoor/north/nextNum`, named
  "Floor 1". No data loss, no user action.
- Photo blobs in IndexedDB stay keyed by pin id, so per-floor numbering does
  not change storage; only export path/filename generation changes.
- Undo/redo snapshots become per-floor (snapshot the active floor only).
- Backups/trash/soft-delete logic is untouched — it operates on the project.

## Not included

- Copying pins between floors
- Cross-floor pin linking (e.g. "same crack, both levels")
- A 3D or stacked-floor view
