Fix the north-arrow interaction so it works reliably on a phone preview and never creates a pin when the user is trying to touch the arrow.

Plan:
1. Increase the north-arrow touch zone on mobile-scale screens.
   - Treat taps near the arrow disc and rotation handle as north-arrow interaction, not plan taps.
   - Use a larger invisible hit area than the visible handle so it is finger-friendly.

2. Add a safe “north interaction guard.”
   - If the touch starts anywhere close to the north arrow, block the pin-drop path.
   - This prevents accidental pins when the user barely misses the handle.

3. Make rotation start from the whole outer ring/handle area.
   - Touching the visible handle or near the outside of the arrow starts rotation.
   - Touching the center disc still moves the arrow.

4. Keep existing behavior unchanged elsewhere.
   - Pins still drop when tapping normal plan space.
   - Existing pin dragging/selection and pan behavior remain unchanged.
   - The north arrow still exports with its saved rotation.

Technical details:
- Update only `public/survey.html`.
- Adjust the `onPointerDown` hit-test before the pin hit-test/drop-pin logic.
- Use screen-space minimum touch sizing, converted through the current zoom scale, so the target remains usable on phones.
- Clear `_maybeTap` and `ui.panning` when a north-arrow zone is touched, so `onPointerUp` cannot create a pin from the same gesture.