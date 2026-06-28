---
name: Symbols on the plan
description: Shared symbol concept across Field Reporter (secondary) and Topo Field (primary); symbol field inside pin dialog + standalone stamp toolbar; design data model once for clean cross-app/merged-app portability
type: feature
---
Symbols live in BOTH apps — design once, share schema:
- **Field Reporter** (floor plan distress survey) — secondary value
- **Topo Field** (distress overlaid on elevation contours) — PRIMARY value; symbols on topo tell the structural story

UX (Option C):
- Symbol field inside pin dialog (primary, photo-attached)
- Standalone symbol-stamp toolbar mode (secondary) for no-photo diagram passes

Cross-app contract (must match in both apps):
- Shared glyph library / symbol set
- Pin schema field: `symbol: string`
- CSV export column: `Symbol`
- Same storage shape

Why: when merged version is built, no translation layer is needed between the two apps' symbol data.
