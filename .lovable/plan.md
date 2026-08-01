# Ghost pin after iOS ZIP download — investigation

## What I verified in `public/survey.html`

- **Both tap-commit paths already guard on open sheets.** The `_maybeTap` path in `onPointerUp()` (lines ~3657-3665) and `onStageClickFallback()` (lines ~3673-3685) both bail if `pinSheet`, `pinPickerSheet`, or `exportSheet` has the `open` class.
- **`openPinSheet()` calls `closeSheets()` as its second line** (~3789), which removes `open` from the export sheet. So a pin sheet opened through the normal path should have closed the export sheet.
- **`exportProjectZip()` never closes the export sheet and never sets `_suppressClickUntil`** (~5770-5784). It creates an `<a>`, clicks it, and leaves the sheet up.
- **`_suppressClickUntil` is only honored in `onStageClickFallback()`** (~3675) — the `_maybeTap` path never checks it, exactly as you noted.
- **There is no `visibilitychange` / `pagehide` cleanup for canvas pointer state.** `_maybeTap`, `_pointers`, and `ui.panning` are only cleared inside pointermove/pointerup, and `onPointerDown()` calls `setPointerCapture()` on the stage.

## What that means

The end state you describe — new pin, its sheet open, **and** the export sheet still up — cannot be produced by the normal in-page sequence, because either guard would have blocked the pin, and if a pin sheet did open it would have closed the export sheet. That points at a **timing/lifecycle problem around the native download**, not a plain missing guard:

Most likely mechanism (unconfirmed, needs instrumentation): the anchor click that triggers the download happens while the page is being frozen by iOS's Quick Look overlay. The stage keeps a captured pointer / live `_maybeTap` (or receives a delayed synthetic pointer or click pair on dismissal). On resume, WebKit replays or completes that gesture against the canvas. Whether the guard sees `exportSheet.open` depends on the exact replay ordering — which explains why fast exports (download UI appears while the gesture is still live) reproduce and slow exports (gesture fully settled first) do not, and why "Preview PDF" — a new tab, no native overlay, no page freeze — never does.

## Proposed work (no code changes yet)

**Step 1 — confirm the mechanism.** Add temporary console instrumentation logging `pointerdown` / `pointerup` / `click` on the stage, `visibilitychange`, and `pagehide` / `pageshow` with timestamps and the current `open` class state of each sheet. Run one fast ZIP export on-device, dismiss the overlay, and read the log. This tells us definitively whether the pin comes from a replayed pointer pair, a lone synthetic click, or a stale `_maybeTap`.

**Step 2 — fix based on what Step 1 shows.** Candidate hardening, applied only as the log justifies:

1. Honor `_suppressClickUntil` in the `_maybeTap` path of `onPointerUp()`, so both commit paths behave identically.
2. Set `_suppressClickUntil = Date.now() + 1200` immediately after the ZIP anchor click in `exportProjectZip()`, so any tap that lands on the canvas right after the native download UI closes is ignored.
3. Clear canvas gesture state (`_maybeTap`, `_pointers`, `_pinchInitial`, `ui.panning`, release pointer capture) on `visibilitychange` to hidden and on `pagehide`, and re-arm `_suppressClickUntil` on return to visible — so a gesture frozen by a system overlay can never complete later as a pin drop.
4. Optionally close the export sheet after a successful ZIP download, so the app returns to a clean state.

**Step 3 — verify.** Repeat the fast-export-and-dismiss cycle on-device with the instrumentation still in place, confirm no pin is created and no sheet stacking occurs, then remove the temporary logging.

## Files touched

`public/survey.html` only.
