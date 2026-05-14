## Goal

Replace the current two-button export (PDF + photos ZIP) with **one button** that downloads a single ZIP containing everything you need for a job: map image, pin list, and photos.

## What's in the ZIP

Filename: `001 - 123 Main St.zip` (pin-count prefix + address, sanitized)

Contents:
```
001 - 123 Main St/
  map.png              ← floor plan with numbered pins drawn on it
  pins.csv             ← one row per pin: #, description, photo count
  photos/
    01-photo1.jpg
    01-photo2.jpg
    02-photo1.jpg
    ...
```

That's it. No JSON, no PDF, no extra files.

## CSV columns

`Pin, Description, Photos`

Example:
```
1, Water heater - Rheem 50gal, 2
2, Main panel - 200A, 1
3, Crawl space access, 0
```

## How the map.png is made

Reuse the same canvas-rendering logic that `exportPdf()` already uses to draw the floor plan + numbered pins, but output a PNG via `canvas.toBlob('image/png')` instead of embedding into a PDF. Same view you see today, just flat.

## UI changes in the export sheet

Before:
- 📄 Download Picture Map (PDF)
- 🗂 Download Photo Folder (ZIP)

After:
- 📦 **Download Project (ZIP)** ← single primary button
- (small helper text listing what's inside)

Old PDF and photos-only buttons are removed. One button, one file.

## Technical notes

- `public/survey.html` only — no other files touched.
- JSZip is already loaded; jsPDF stays loaded but unused (we can remove the script tag too — saves ~80KB).
- Photo naming uses the existing `NN-photoN.jpg` pattern from `exportPhotosZip()`, just nested under `photos/`.
- Map render: extract the pin-drawing code from `exportPdf()` into a shared `renderMapToCanvas()` helper, then both old PDF code (if we keep it) and new PNG export call it. Cleaner either way.
- File-saver pattern stays the same (Blob → object URL → `<a download>` click).

## Out of scope (your call later)

- Re-importable project file (JSON)
- Per-photo descriptions in CSV
- GPS coordinates in CSV
- Auto-upload to cloud / email

Approve and I'll build it. Should be ready well before Saturday.