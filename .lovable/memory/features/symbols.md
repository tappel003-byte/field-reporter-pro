---
name: Symbols (shared concept)
description: Symbol stamping is planned for Field Reporter AND Topo Field; design data model once so it ports between apps and into the eventual merged version
type: feature
---
Symbols (crack types, distress markers, settlement indicators, etc.) will live in:
- **Field Reporter** (distress survey on floor plans) — secondary value
- **Topo Field** (distress patterns overlaid on elevation contours) — PRIMARY value; this is where symbols really shine because they tell the structural story on top of topo

When building symbol UX, design ONCE for both:
- Shared symbol set / glyph library
- Same pin schema field (`symbol: string`)
- Same CSV export column name
- Same storage shape

Goal: when the merged version is built, no translation layer is needed between the two apps' symbol data.
