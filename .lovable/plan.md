Fix the tablet setup screen by changing only `public/survey.html` layout:

1. Keep the setup header fixed at the top and make only the form body scroll.
2. Make the `Start Survey` footer fixed to the bottom of the visible tablet screen, above the browser/nav safe area.
3. Add enough bottom padding to the form body so the footer never covers the North Arrow / Starting Pin fields.
4. Keep the current enable/disable logic: Start Survey stays disabled until both an address/coordinates and floor plan image are present.

Technical details:
- Replace the current sticky footer approach, which can sit below the scrollable content on some tablet browsers, with a fixed footer inside the setup screen.
- Use `height: 100dvh`/fallback sizing and `overflow-y: auto` on `.setup-body` so tablet Safari/Chrome viewport changes do not hide the button.
- No GPS or camera logic changes in this fix.