## Revert yellow drawing color

Yellow is causing layout breaks (toolbar wraps/crowds on tablet) and is hard to tap. Removing it for now; revisit in phase 2 when we have a dedicated highlighter toolbar.

### Changes (`public/survey.html`)

1. Remove the yellow swatch button from the main draw toolbar (line 477).
2. Remove the yellow swatch button from the photo-viewer annotate toolbar (line 580).
3. Revert the landscape-phone tightening that was added to fit 6 colors — restore the earlier comfortable sizing (`.dt-color` 30×30, gaps 4px, padding 4px) so the remaining 5 colors are easy to tap on tablet and phone.

No JS changes needed — the color picker reads from the buttons present in the DOM.

### Phase 2 note
When we introduce a separate highlighter/marker tool (distinct stroke style), yellow can live on that secondary toolbar without competing with the primary 5-color row.

---

## Decision: photo capture "Use Photo" confirmation — solved by going native

**Status:** Not a web-app problem to fix. Resolved by future native wrapper.

### Context
On both iPhone (Safari) and Samsung tablet (Chrome), tapping the camera button opens the native OS camera, which forces a "Use Photo / Retake" confirmation step. This is browser/OS behavior triggered by `<input type="file" capture="environment">` — there is no iOS or Android user setting to disable it.

### Why we're not building a workaround
- A `getUserMedia` burst overlay was prototyped earlier (May 10) but is not currently in `public/survey.html`. Rebuilding it adds complexity, permission edge cases, and lower image quality than a real camera.
- For volume / burst shots, the user prefers a dedicated camera + import workflow — better quality, faster, no in-app camera UX needed.
- This app is intended to ship as a **PWA first, then a native app** (Capacitor or similar). The native camera plugin captures frames directly with no OS confirmation prompt — the "Use Photo" step disappears for free.

### Decision
- Keep the current single-shot `<input type="file" capture>` flow in the web version. It's acceptable for the PWA phase.
- Do NOT reintroduce the `getUserMedia` burst overlay.
- Revisit camera UX when we build the native shell — that's the right layer to solve it.

### Phase 2 / native note
When wrapping as a native app, swap the camera input for the native camera plugin and add true rapid-capture there. Web version stays simple.