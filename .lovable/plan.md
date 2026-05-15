## Goal

Add a **Location** field to each pin so reports say "Pin #4 — Bath Primary" instead of just "Pin #4". Phone-first, accordion picker grouped by category. No search box, no predictive text — we'll add those later only if they're missed.

## UX (in the existing pin sheet)

Above the photo strip and description, add a single tappable row:

```text
┌─ Pin #4 ───────────────────── Done ┐
│  📍 Location:  [ Set location › ]  │  ← when empty
│  📍 Location:  [ Bath Primary  ✕ ] │  ← when set, ✕ clears
├────────────────────────────────────┤
│  [photo strip]                     │
│  [description textarea]            │
└────────────────────────────────────┘
```

Tapping the chip opens a **Location picker sheet** (replaces the pin sheet temporarily, same bottom-sheet pattern already used by the pin picker / export sheets):

```text
┌─ Choose location ─────────── Cancel ┐
│ ▾ Wet Areas                         │
│   [Kitchen] [Pantry] [Laundry]      │
│   [Powder] [Bath Hall]              │
│   [Bath Primary] [Bath Ensuite]     │
│ ▸ Bedrooms                          │
│ ▸ Living Areas                      │
│ ▸ Entry & Circulation               │
│ ▸ Exterior / Site                   │
│ ▸ Specialty                         │
│ ▸ Other                             │
└─────────────────────────────────────┘
```

- Only one category open at a time (single-open accordion).
- Tap a room chip → sets location, closes picker, returns to pin sheet.
- "Other" category contains a single "Custom…" chip that prompts for a free-text label (covers anything we haven't catalogued).
- Last-used category remembered per session and pre-opened on next pin.

## Room catalogue (v1)

Plain list, easy to extend later. Names match what an inspector would actually write.

- **Wet Areas** — Kitchen, Pantry, Laundry, Powder Room, Bath (Hall), Bath (Primary), Bath (Ensuite), Bath (Jack & Jill), Wet Bar
- **Bedrooms** — Primary Bedroom, Bedroom 2, Bedroom 3, Bedroom 4, Guest Bedroom, Nursery, Closet (Primary), Closet (Walk-in)
- **Living Areas** — Living Room, Family Room, Great Room, Dining Room, Breakfast Nook, Den, Office, Library, Media Room, Sunroom
- **Entry & Circulation** — Entry / Foyer, Mudroom, Hallway, Stairwell, Landing
- **Exterior / Site** — Front Elevation, Rear Elevation, Side Elevation (L), Side Elevation (R), Roof, Garage, Driveway, Porch, Deck, Patio, Yard, Fence, Site/Grading
- **Specialty** — Basement, Attic, Crawlspace, Mechanical Room, Utility, Storage, Gym, Theater, Wine Room
- **Other** — Custom… (free-text)

## Data model

Extend each pin:

```text
{ id, num, x, y, photos[], description,
  location:  string | null,    // display label, e.g. "Bath Primary"
  category:  string | null }   // e.g. "Wet Areas" or "Custom"
```

Backwards compatible — existing saved projects load fine; missing fields render as empty.

## Export wiring

- **`pins.csv`** — add two columns: `location`, `category`. Place them right after `pin_number`.
- **PDF / map exports** — pin numbers on the plan stay unchanged. The descriptions list (already rendered alongside the map in the export flow) shows `Pin #4 — Bath Primary` as the heading, with description underneath.
- **Pin picker sheet** (the one that lists all pins) — show the location next to the pin number so it's easy to find.

## Out of scope (deferred until we feel the pain)

- Search box / predictive text inside the picker.
- Per-project custom catalogue.
- Reordering or favoriting categories.
- Tablet-specific side panel layout — bottom sheet works fine on tablet for v1.

## Files touched

- `public/survey.html` only — markup for the chip + picker sheet, JS for the catalogue + open/close + save, CSV column addition, pin-list rendering tweak.

## Open question

Anything missing from the room catalogue that you know you'll want on day one? Easier to add now than to discover mid-walkthrough.
