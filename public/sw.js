/*
 * Offline support. The app shell is cached on install and served cache-first,
 * so a dead gym connection never leaves you staring at a blank page mid-set.
 * Training data lives in localStorage and never touches the network.
 */
const CACHE = 'bodyio-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;

  // navigations: cache first, network as a fallback, so it opens instantly offline
  if (request.mode === 'navigate') {
    e.respondWith(caches.match('/index.html').then((r) => r || fetch(request)));
    return;
  }

  // hashed build assets never change under the same name, so cache them as they load
  e.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
    )
  );
});
