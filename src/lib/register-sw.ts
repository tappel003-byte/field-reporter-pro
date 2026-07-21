// Guarded service worker registration + update tracking. The service worker
// caches the app shell (HTML, JS, CSS) so the app can cold-start with no
// network, and notifies the UI when a new version is waiting.

const SW_PATH = "/sw.js";
const KILL_KEY = "lovable:sw:killed";
const APP_CACHE_NAMES = new Set([
  "html-navigations",
  "app-shell-assets",
  "cdn-libs",
  "html-shell",
]);

type WaitingListener = (waiting: ServiceWorker) => void;
const waitingListeners = new Set<WaitingListener>();
let currentWaiting: ServiceWorker | null = null;
let lastUpdateCheck = 0;

export function onWaitingWorker(listener: WaitingListener): () => void {
  waitingListeners.add(listener);
  if (currentWaiting) listener(currentWaiting);
  return () => {
    waitingListeners.delete(listener);
  };
}

function notifyWaiting(worker: ServiceWorker) {
  currentWaiting = worker;
  waitingListeners.forEach((l) => {
    try {
      l(worker);
    } catch {
      // ignore
    }
  });
}

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
        // ignore
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
          .filter(
            (name) => APP_CACHE_NAMES.has(name) || name.startsWith("workbox-"),
          )
          .map((name) => caches.delete(name).catch(() => false)),
      );
    }
  } catch {
    // best-effort cleanup
  }
}

function checkForUpdate(registration: ServiceWorkerRegistration) {
  const now = Date.now();
  if (now - lastUpdateCheck < 10_000) return;
  lastUpdateCheck = now;
  registration.update().catch(() => {
    // best-effort — offline is fine
  });
}

function trackUpdates(registration: ServiceWorkerRegistration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    notifyWaiting(registration.waiting);
  }
  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        notifyWaiting(installing);
      }
    });
  });
}

// Deferred reload: never reload while the app is visible. Wait until the
// user backgrounds it (visibilitychange -> hidden) or returns from bfcache
// (pageshow). This avoids yanking the page mid-input.
let reloadedForUpdate = false;
let reloadPending = false;

function performReload() {
  if (reloadedForUpdate) return;
  reloadedForUpdate = true;
  window.location.reload();
}

function schedulePendingReload() {
  if (reloadPending) return;
  reloadPending = true;

  const tryReload = () => {
    if (document.visibilityState === "hidden") {
      performReload();
    }
  };

  document.addEventListener("visibilitychange", tryReload);
  window.addEventListener("pageshow", (e) => {
    if ((e as PageTransitionEvent).persisted) performReload();
  });
}

function setupControllerReload() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadedForUpdate) return;
    if (document.visibilityState === "hidden") {
      performReload();
    } else {
      schedulePendingReload();
    }
  });
}

export function registerAppShellSW(): void {
  if (!isBrowser() || !("serviceWorker" in navigator)) return;

  if (readKillSwitch() || isPreviewOrDevHost() || window.self !== window.top) {
    void unregisterMatchingAndPurge();
    return;
  }

  const doRegister = () => {
    setupControllerReload();
    navigator.serviceWorker
      .register(SW_PATH, { scope: "/" })
      .then((registration) => {
        trackUpdates(registration);
        checkForUpdate(registration);

        window.addEventListener("pageshow", () => checkForUpdate(registration));
        window.addEventListener("focus", () => checkForUpdate(registration));
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") checkForUpdate(registration);
        });
      })
      .catch(() => {
        // offline support is progressive enhancement
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", doRegister, { once: true });
  } else {
    doRegister();
  }
}
