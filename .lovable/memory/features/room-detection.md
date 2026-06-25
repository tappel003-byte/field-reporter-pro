---
name: Room auto-detection
description: Vision LLM scans uploaded plan at setup, extracts room labels with normalized coords; powers Room column in pins.csv
type: feature
---
On plan upload during project setup, POST plan image (downscaled to ~1200px) to `/api/detect-rooms` (TanStack server route → Lovable AI Gateway, `google/gemini-3-flash-preview`, JSON output). Returns `rooms: [{name,x,y,confidence}]` where x,y are 0–1 of label center.

Stored on `project.rooms[]`. User can tap chips during setup to remove false positives. Skip is always allowed (network fail → empty list, setup still proceeds).

`pinRoom(proj, p)` finds nearest room by Euclidean distance in normalized coords. Adds **Room** column to internal-mode `pins.csv` between Photo Numbers and Direction. Combined with Direction, downstream LLM can write "SW corner of Master Bedroom" naturally.

Endpoint: `src/routes/api/detect-rooms.ts`. Uses `LOVABLE_API_KEY` server-side only.
