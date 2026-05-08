## Categories (color = location)

| Color | Category |
|---|---|
| Green | Wall |
| Blue | Ceiling |
| Yellow | Floor |
| Orange | Separation / Gap |
| Red | Slab crack |
| Gray | Other / Exterior |

- **Hazard triangle** overlay on any pin with severity ≥ 4 (replaces a dedicated "structural movement" color).
- **Openings** (window/door): parked. Tagged via material field for now.
- **Material** stays as a separate metadata field.
- **High-severity pins (≥4) require a photo** before they can be saved.

## Pin flow — single panel, 6–7 seconds end-to-end

One tap to drop, then one panel with everything in order:

1. Tap canvas → pin drops instantly with default category
2. Category (one tap)
3. Material (one tap)
4. Severity slider (optional)
5. Voice-dictate note (or skip)
6. Photo (or skip — required only if severity ≥ 4)
7. Done → next pin

No modals on top of modals. Stop early on any pin and it still saves with whatever's filled in. **Long-press** the canvas to drop a new pin pre-filled with the previous pin's category, material, and descriptors.

## Descriptors (multi-select per pin)

- Hairline / Wide / Through-crack
- **Shear** (Drywall, CMU, Stucco)
- **Corner crack** (Wall + Ceiling)
- Stair-step (CMU, Brick)
- Spalling, Efflorescence, Bowing, Settlement, Moisture

## Migration of existing pins

Auto-map by best guess; user can re-categorize:
- drywall/CMU/stucco/tile-on-wall → Wall
- drywall/tile on ceiling → Ceiling
- tile/concrete on floor → Floor
- window/door → Wall (material preserved)
- everything else → Other

## Plan canvas

- **North arrow** — draggable + rotatable handle, saved per project
- **Drag-to-reorder pins** — manual only

## Site Photos tray (unattached photos)

Built for speed (50+ at a time):

- Burst import from camera roll, queues in background
- Auto GPS + timestamp
- Auto-orient + compress on import (originals preserved)
- Optional tag (Grading, Drainage, Access, Exterior, Roof, Other)
- Optional one-line caption
- "Promote to pin" if a site photo belongs on the plan

## Exports

- **Floor plan** — three PNG presets:
  1. Plan only
  2. Plan + numbered pins
  3. Plan + pins + legend
- **Per-pin photo card** — 4×6 landscape (photo top, pin # + category color dot + description below). Exported as **both** a zip of PNGs and a single multi-page PDF.
- **CSV export** gets `Category` and `Shear` columns.

## Project-level polish

- **Job address auto-fill** from first GPS fix (reverse-geocoded, editable)
- **Date + weather stamp** captured at job start
- **Auto-save** on every change
- **"Recently deleted" trash** — 30-day recovery for pins and photos
- **Project duplicate** — clone a job as a template
- **Bright mode** (high-contrast outdoor) toggle, plus dark mode
- **Haptic tick** when a pin drops

## Photo handling — preserve originals

- Compressed thumbnail used for in-app display and fast loading
- **Original full-res file kept** for evidence-grade exports later
- Supplemental high-res shots from a real camera can be added to existing pins or the Site Photos tray after the fact

## Explicitly skipped

Rooms/areas, per-pin N/S/E/W elevation tag, filter by category/severity, scale calibration, inspector/company on project, photo-required toggle (covered by severity ≥ 4 rule), structural-movement color (covered by hazard triangle).

## Technical notes

- All work happens in `public/survey.html`. Frontend/presentation only — no backend or schema changes.
- New pin fields: `category`, `descriptors[]`. Existing `surface`/`material` preserved.
- Pin renderer: category drives base color; SVG hazard-triangle badge layered when `severity >= 4`.
- North arrow stored on the project (position + rotation).
- Site Photos in a separate `sitePhotos[]` array on the project record.
- Address auto-fill: free reverse-geocode (Nominatim) called once per project on first GPS fix; cached.
- Weather stamp: free endpoint (Open-Meteo) keyed off project GPS + start time.
- Photo handling: client-side EXIF orientation fix; resized thumbnail + original both kept.
- Auto-save: debounce ~500ms; trash is a soft-delete flag with 30-day sweep.
- PDF export: jsPDF for the photo-card PDF; PNGs via canvas export.
