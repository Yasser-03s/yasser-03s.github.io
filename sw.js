const CACHE = 'dunk-rr-v4';
const SHELL = [
  './', './index.html', './styles.css', './app.js', './manifest.webmanifest', './offline.html',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const isImage = req.destination === 'image';
    const isSameOrigin = new URL(req.url).origin === self.location.origin;
    const cache = await caches.open(CACHE);

    if (isImage) {
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const response = await fetch(req, {mode: isSameOrigin ? 'same-origin' : 'no-cors'});
        if (response && (response.ok || response.type === 'opaque')) {
          try { await cache.put(req, response.clone()); } catch (_) {}
        }
        return response;
      } catch (_) {
        return cached || Response.error();
      }
    }

    if (isSameOrigin) {
      try {
        const response = await fetch(req);
        if (response.ok) cache.put(req, response.clone()).catch(() => {});
        return response;
      } catch (_) {
        return (await cache.match(req)) || (await caches.match('./offline.html'));
      }
    }
    const cached = await cache.match(req);
    try { return await fetch(req); } catch (_) { return cached || Response.error(); }
  })());
});
