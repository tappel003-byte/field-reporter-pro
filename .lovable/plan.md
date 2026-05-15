## Revert yellow drawing color

Yellow is causing layout breaks (toolbar wraps/crowds on tablet) and is hard to tap. Removing it for now; revisit in phase 2 when we have a dedicated highlighter toolbar.

### Changes (`public/survey.html`)

1. Remove the yellow swatch button from the main draw toolbar (line 477).
2. Remove the yellow swatch button from the photo-viewer annotate toolbar (line 580).
3. Revert the landscape-phone tightening that was added to fit 6 colors — restore the earlier comfortable sizing (`.dt-color` 30×30, gaps 4px, padding 4px) so the remaining 5 colors are easy to tap on tablet and phone.

No JS changes needed — the color picker reads from the buttons present in the DOM.

### Phase 2 note
When we introduce a separate highlighter/marker tool (distinct stroke style), yellow can live on that secondary toolbar without competing with the primary 5-color row.