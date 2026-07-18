// Guarded service-worker registration. App-shell offline only.
// Never registers in dev, iframe preview, Lovable preview hosts, or when the kill switch is set.
//
// Kill switch:
//   Visit any page with `?sw=off` once — it persists in localStorage and the SW stays unregistered
//   on every future visit until you visit `?sw=on` to clear it.

const SW_PATH = "/sw.js";
const KILL_KEY = "lovable:sw:killed";

function isBrowser() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

function readKillSwitch() {
  if (!isBrowser()) return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const sw = params.get("sw");
    if (sw === "off") {
      try {
        window.localStorage.setItem(KILL_KEY, "1");
      } catch {
        /* storage disabled — still honor the query flag for this load */
      }
      return true;
    }
    if (sw === "on") {
      try {
        window.localStorage.removeItem(KILL_KEY);
      } catch {
        /* ignore */
      }
      return false;
    }
    return window.localStorage.getItem(KILL_KEY) === "1";
  } catch {
    return false;
  }
}

function isPreviewOrDevHost() {
  if (!isBrowser()) return true;

  const { hostname } = window.location;
  return (
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

function isEmbeddedPublishedSurvey() {
  if (!isBrowser()) return false;
  if (window.self === window.top) return false;
  return !isPreviewOrDevHost();
}

async function unregisterMatchingAndPurge() {
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
            /* ignore */
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
    /* best-effort cleanup */
  }
}

function registerAppShellSW() {
  if (!isBrowser()) return;
  if (!("serviceWorker" in navigator)) return;

  // The React shell embeds survey.html at `/`; that child frame must not undo
  // the parent page's service-worker registration. Direct `/survey.html` loads
  // still register normally because they are top-level pages.
  if (isEmbeddedPublishedSurvey()) return;

  const refused = readKillSwitch() || isPreviewOrDevHost();
  if (refused) {
    void unregisterMatchingAndPurge();
    return;
  }

  const register = () => {
    navigator.serviceWorker.register(SW_PATH, { scope: "/" }).catch(() => {
      // no-op: offline support is a progressive enhancement
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
}

registerAppShellSW();