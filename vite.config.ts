// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null, // wrapper module is the only registrar
        filename: "sw.js",
        devOptions: { enabled: false },
        workbox: {
          navigateFallback: "/survey.html",
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
          // Precache the built app shell (HTML/JS/CSS) plus the static survey page.
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
          globIgnores: ["**/node_modules/**", "sw.js", "workbox-*.js"],
          // TanStack Start emits `client/` and `server/` subdirs, but the
          // deployed origin serves those files at the root. Rewrite the
          // precache manifest so cached URLs match what the browser fetches.
          manifestTransforms: [
            async (entries) => {
              const manifest = entries
                .filter((e) => !e.url.startsWith("server/"))
                .map((e) =>
                  e.url.startsWith("client/")
                    ? { ...e, url: e.url.slice("client/".length) }
                    : e,
                );
              return { manifest, warnings: [] };
            },
          ],
          // survey.html loads two external scripts; cache them so the shell opens offline.
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.origin === "https://cdn.jsdelivr.net" &&
                (url.pathname.includes("jszip") || url.pathname.includes("jspdf")),
              handler: "CacheFirst",
              options: {
                cacheName: "cdn-libs",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin && request.destination === "document",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-shell",
                networkTimeoutSeconds: 3,
              },
            },
          ],
        },
      }),
    ],
  },
});
