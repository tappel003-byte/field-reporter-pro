# Separate location numbers from photo numbers

## Concept
- **Pin number on the plan** = a **location** (1, 2, 3, … 34). Stays unchanged.
- **Photo number** = a **global sequential count** across the whole survey (1, 2, 3, … 60).
- These two numbering systems are independent. The plan never shows photo numbers; the export filenames never show location numbers.

## What changes

### 1. Exported photo filenames (internal mode)
Today: `01-photo1.jpg`, `01-photo2.jpg`, `02-photo1.jpg` …
After: `photo-01.jpg`, `photo-02.jpg`, … `photo-60.jpg`

Numbering order: walk pins in pin-number order, and within each pin walk photos in the order they were taken. So:
- Location 1 has 3 photos → `photo-01.jpg`, `photo-02.jpg`, `photo-03.jpg`
- Location 2 has 1 photo → `photo-04.jpg`
- Location 3 has 2 photos → `photo-05.jpg`, `photo-06.jpg`
- …continues through location 34

Zero-padding width auto-sized to the total (2 digits for ≤99, 3 digits for ≤999).

### 2. `pins.csv` gets a "Photos" range column
Today (internal): `Pin, Type, Description, Photos` — where `Photos` is just a count.
After (internal): `Location, Type, Description, Photo Count, Photo Numbers`

Example row:
```
1, Interior, "Kitchen leak under sink", 3, 1-3
2, Interior, "Hallway", 1, 4
3, Exterior, "North wall crack", 2, 5-6
```

`Photo Numbers` uses compact ranges when consecutive (`1-3`), comma-list when not (`4, 7, 9`). Rename header `Pin` → `Location` to reinforce the concept.

### 3. Wording cleanup in the UI
- Pin sheet title stays `Pin #N` (this is the location number — no change needed).
- "Photos" label on the photo strip stays as-is — these are still photos under a location, just no longer numbered per-pin in the export.
- No change to the plan rendering: pins still show their location number 1..N.

### 4. External mode is untouched
External mode is already a separate counting model (the user manages a real camera, pins reference picture-number ranges). No changes there.

## Files affected
- `public/survey.html` only.
  - Photo export loop (~line 3523): switch from per-pin filename to global counter.
  - CSV header + row builder (~line 3512–3519): add Photo Numbers column, rename Pin → Location, compute ranges.
  - `Pin, Description, Photos` header in the "What you'll get" help text (~line 637): update to match.

## Out of scope
- No changes to how pins are created, dragged, deleted, or rendered on the plan.
- No changes to the interior/exterior toggle or its grey rendering.
- No changes to external mode.
- No change to the PDF export's pin labels (still location numbers).
