---
name: Room detection
description: Manual rooms (default) + free in-browser OCR "Read labels" only. AI auto-scan has been removed — do not re-add without explicit ask.
type: feature
---
Setup screen has two room actions:
1. **Manual rooms** — primary. Tap plan to drop, pick from ROOM_PRESETS (includes W.I.C, Primary Bedroom/Bathroom, Other...).
2. **🔍 Read labels** — free, runs Tesseract.js in browser (CDN loaded on demand). 3-pass scan (sparse, block, rotated 90°) on a preprocessed upscaled B&W canvas; dedupes by proximity and confidence; numbers duplicates.

AI auto-scan via `/api/detect-rooms` was removed (burned credits, unreliable coordinates). The route file, button, `detectRoomsForSetup`, `confirmDetectRoomsForSetup`, and `looksLikeBadRoomScan` are all gone. Do NOT add any automatic scan on plan upload.

Rooms power the Room column in pins.csv (compass-disambiguated by Front Door direction).
