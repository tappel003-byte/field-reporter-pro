# Fix: home screen locks up

## What I checked

I loaded the app fresh in a clean browser here — the home screen renders and works, with no JavaScript errors. So the freeze is not in the page itself; it is triggered by something on your phone: either the saved survey data, or a stale cached copy of the app still installed on the home screen.

Two candidate causes, neither confirmed yet:

1. A startup step (backup check, export-reminder banner, trash purge, project-list render) throws on your data. When that happens mid-startup, the rest of the setup never runs, so buttons look normal but nothing is wired up — exactly the "everything is dead" symptom.
2. Leftover data shape from the multi-floor build that got reverted. Surveys saved during that session may have their pins and floor plan stored in a structure the current code no longer understands. Your screenshot shows all four surveys at "0 pins", which fits.

Because I cannot read your phone's storage from here, step 1 of this plan is to make the app tell us what is failing instead of failing silently.

## The plan

1. **Make the failure visible.** Add a global error catcher that shows a small red bar at the top of the home screen with the actual error message and line, instead of dying quietly. This stays in for one release so we get the real cause on your next open.

2. **Make startup crash-proof.** Wrap each independent startup task (backups, reminder banner, trash purge, update check, project list) in its own guard so one bad task can no longer take down every button on the screen. Also force-clear any stuck full-screen overlay whenever the home screen shows, in case an invisible sheet backdrop is swallowing taps.

3. **Recover multi-floor-era surveys.** On load, detect surveys saved in the floors-based shape and read their first floor's pins and plan back into the normal fields, so those four surveys open with their pins and floor plan intact instead of showing empty. Non-destructive: nothing is deleted, the old fields stay in place.

4. **Confirm you are on the new build.** After the change, on your phone: fully close the app, reopen once while online, tap "Update app", then reopen. If the red error bar appears, send me a screenshot of it and I fix the exact cause.

## Technical notes

- All changes are in `public/survey.html`.
- Error catcher: `window.onerror` + `unhandledrejection` handlers registered before any other init code, rendering into a fixed banner element.
- Startup hardening: individual `try/catch` around each init call in the boot sequence; `#scrim.active` and any `.sheet.open` cleared on home-screen render.
- Legacy shim: at project load, if `project.floors` is an array and top-level `pins`/plan image are missing, hydrate from `floors[0]`. Read-only migration, written back only on next normal save.
