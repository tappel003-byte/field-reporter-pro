const SW_PATH = "/sw.js";
const KILL_KEY = "lovable:sw:killed";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

function readKillSwitch(): boolean {
  if (!isBrowser()) return false;
  try {
    const sw = new URLSearchParams(window.location.search).get("sw");
    if (sw === "off") {
      try {
        window.localStorage.setItem(KILL_KEY, "1");
      } catch {
        // storage may be unavailable; still honor this load
      }
      return true;
    }
    if (sw === "on") {
      try {
        window.localStorage.removeItem(KILL_KEY);
      } catch {
        // ignore
      }
      return false;
    }
    return window.localStorage.getItem(KILL_KEY) === "1";
  } catch {
    return false;
  }
}

function isPreviewOrDevHost(): boolean {
  if (!isBrowser()) return true;

  const { hostname } = window.location;
  return (
    !import.meta.env.PROD ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev") ||
    hostname === "lovable.dev" ||
    hostname.endsWith(".lovable.dev")
  );
}

async function unregisterMatchingAndPurge(): Promise<void> {
  if (!isBrowser() || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs.map(async (registration) => {
        const url =
          registration.active?.scriptURL ||
          registration.installing?.scriptURL ||
          registration.waiting?.scriptURL ||
          "";
        if (url.endsWith(SW_PATH)) {
          try {
            await registration.unregister();
          } catch {
            // ignore
          }
        }
      }),
    );
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => /workbox|precache|runtime|html-shell|cdn-libs/i.test(name))
          .map((name) => caches.delete(name).catch(() => false)),
      );
    }
  } catch {
    // best-effort cleanup
  }
}

export function registerAppShellSW(): void {
  if (!isBrowser() || !("serviceWorker" in navigator)) return;

  if (readKillSwitch() || isPreviewOrDevHost() || window.self !== window.top) {
    void unregisterMatchingAndPurge();
    return;
  }

  const register = () => {
    navigator.serviceWorker.register(SW_PATH, { scope: "/" }).catch(() => {
      // offline support is progressive enhancement
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
}
