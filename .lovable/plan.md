All work in `public/survey.html`.

## 1. Bottom "Edit pin ▾" button + slide-up list
- Add a full-width button above the existing tool toolbar: `📍 Edit pin ▾  (N pins)`.
- Tap → bottom sheet slides up titled "Select a pin", listing every pin as `Pin #N — <first ~30 chars of description>`.
- Tap a row → list closes, that pin's existing edit sheet opens, plan centers on that pin.
- Tap outside or "Cancel" → closes without selecting.
- 0 pins → button disabled, label `(0 pins)`.

## 2. Reliable pin tap on the plan
- Keep current behavior. Increase invisible tap target so off-center pins are easier to hit on mobile.

## 3. Delete pin + auto-renumber
- Delete in the pin edit sheet removes the pin.
- Remaining pins renumber sequentially by creation order (delete #4 → old #5 becomes #4, #6→#5, …).
- `nextNum` resets to `pins.length + 1`.
- SVG labels and the Edit-pin list update immediately.

## 4. Delete individual photos inside a pin
- Each thumbnail gets a small ✕ in the corner.
- Tap ✕ → confirm → photo removed, strip re-renders.

## 5. Restore the draw icon ✏️
- Toolbar markup still has it but it's hidden at 440px. Fix the CSS so 📍 ✏️ 📤 all render without clipping.

## Out of scope
- No changes to drawing behavior, North arrow, export format, or storage shape beyond what renumber/photo-delete require.

## Verification before reporting done
- 440×798 preview, project with multiple pins.
- Tap pin on plan → edit sheet opens.
- Tap "Edit pin ▾" → list opens → tap Pin #2 → its sheet opens.
- Delete Pin #2 of 4 → numbers become 1, 2, 3 on plan and in list.
- Delete one photo inside a pin → strip updates, others remain.
- 📍 ✏️ 📤 all visible in toolbar.
