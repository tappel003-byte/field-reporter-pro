export function registerAppShellSW(): void {
  if (typeof window === "undefined") return;
  const script = document.createElement("script");
  script.type = "module";
  script.src = "/register-sw.js";
  script.async = true;
  document.head.appendChild(script);
}
