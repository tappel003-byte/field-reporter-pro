# Fix: "Add" photo should open the camera directly

## What's happening

The Add button's file input is set up to go straight to the camera (`capture="environment"`), but a small startup script in `public/survey.html` (lines 960-966) detects iPhone/iPad and strips that attribute. That's why iOS shows the Photo Library / Take Photo / Choose Files menu instead of the camera.

That strip was added earlier to work around iOS ignoring multi-select when the camera is forced.

## The change

Remove that iOS startup script so the camera opens immediately on Add.

Trade-off: on iOS, forcing the camera means Add captures one photo at a time (no multi-select). Multi-photo picking is still available via the Upload button next to it, and Quick Capture still handles bursts.

## Technical detail

Delete the `DOMContentLoaded` block at `public/survey.html` lines 959-967 that calls `el.removeAttribute('capture')`. Nothing else changes; the input keeps `accept="image/*" capture="environment" multiple`.
