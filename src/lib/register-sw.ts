export function registerAppShellSW(): void {
  if (typeof window === "undefined") return;
  void import(/* @vite-ignore */ "/register-sw.js").catch(() => {
    // no-op: offline support is a progressive enhancement
  });
}
