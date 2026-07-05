const CACHE_NAME = "mbn-health-shell-v1";
const SHELL_ASSETS = ["/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Network-first for navigations (always prefer fresh data for this app),
// falling back to the cached shell only when fully offline. Everything else
// (API calls, cross-origin requests) is left untouched.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((cached) => cached ?? caches.match("/offline.html"))),
  );
});
