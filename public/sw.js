// One-release recovery worker for previously installed offline copies.
// It intentionally does not cache or intercept requests.

function isAppCache(name) {
  const workboxCache =
    /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name) &&
    name.endsWith(self.registration.scope);

  return (
    workboxCache ||
    name === "html-navigations" ||
    name === "app-shell-assets" ||
    name === "cdn-libs" ||
    name === "html-shell" ||
    name.startsWith("offline-shell-") ||
    name.startsWith("sw-reset-fr-")
  );
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const appCacheNames = cacheNames.filter(isAppCache);
        await Promise.allSettled(
          appCacheNames.map((name) => caches.delete(name)),
        );

        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(
          windowClients.map((client) => client.navigate(client.url)),
        );
      } finally {
        await self.registration.unregister();
      }
    })(),
  );
});