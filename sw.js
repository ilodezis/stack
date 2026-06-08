const CACHE_NAME = 'ritual-v12';
const ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './js/app.js',
  './manifest.json?v=12',
  './icon.png?v=12',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/modular/sortable.esm.js'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Hybrid Strategy
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // NETWORK-FIRST: Navigation requests (index.html)
  // Always fetch fresh HTML from network to get latest app version
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed (offline), serve from cache
          return caches.match(request);
        })
    );
    return;
  }

  // CACHE-FIRST with background update: Static assets (CSS, JS, images)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'manifest'
  ) {
    e.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve cached, but update in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch((err) => {
            console.log('[SW] Background fetch failed:', err);
          });
          return cachedResponse;
        }
        return fetch(request);
      })
    );
    return;
  }

  // Default: Network-first for everything else
  e.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
