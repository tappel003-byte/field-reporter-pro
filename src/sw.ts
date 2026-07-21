/// <reference lib="webworker" />
// Custom service worker source used by vite-plugin-pwa's injectManifest strategy.
// Workbox injects the precache manifest into self.__WB_MANIFEST at build time.

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Precache the built assets injected by workbox-build.
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// HTML navigations — NetworkFirst so users get fresh HTML online,
// fall back to cached shell offline.
registerRoute(
  ({ request, url }) =>
    request.mode === "navigate" &&
    !url.pathname.startsWith("/~oauth") &&
    !url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "html-navigations",
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxEntries: 32 })],
  }),
);

// Same-origin built assets (hashed JS/CSS/worker) — cache-first for
// instant offline cold-start of the app shell.
registerRoute(
  ({ url, request, sameOrigin }) =>
    sameOrigin &&
    (request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "worker") &&
    !url.pathname.startsWith("/~oauth") &&
    !url.pathname.startsWith("/api/"),
  new CacheFirst({
    cacheName: "app-shell-assets",
    plugins: [new ExpirationPlugin({ maxEntries: 128 })],
  }),
);

// survey.html loads jszip/jspdf from jsdelivr — cache them so the shell
// works offline for export flows.
registerRoute(
  ({ url }) =>
    url.origin === "https://cdn.jsdelivr.net" &&
    (url.pathname.includes("jszip") || url.pathname.includes("jspdf")),
  new CacheFirst({
    cacheName: "cdn-libs",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 90 }),
    ],
  }),
);

// Offline navigation fallback — serve the precached survey shell.
setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") {
    const cache = await caches.open("html-navigations");
    const cached =
      (await cache.match("/survey.html")) || (await cache.match("/"));
    if (cached) return cached;
    // Precache fallback
    const precache = await caches.match("/survey.html");
    if (precache) return precache;
  }
  return Response.error();
});

// Activate new versions promptly. The visible page (public/survey.html) owns
// the reload timing — it defers reload until the tab is hidden.
self.addEventListener("install", () => {
  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Legacy: still honor an explicit SKIP_WAITING message if anything sends one.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
