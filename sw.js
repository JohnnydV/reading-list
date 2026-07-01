// Reading List — network-first service worker.
// Purpose: on iOS, a home-screen web app aggressively caches its shell, so re-uploaded HTML
// never reaches the device. Network-first means: always try to fetch the latest when online,
// fall back to the cache only when offline. This keeps the installed app up to date.
const CACHE = "reading-list-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;                 // don't touch non-GET
  e.respondWith(
    fetch(req)
      .then((res) => {
        // cache good same-origin responses for offline fallback
        try {
          if (res && res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
        } catch (_) {}
        return res;
      })
      .catch(() => caches.match(req))               // offline → serve last cached copy
  );
});
