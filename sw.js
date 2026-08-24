const CACHE_NAME = 'caarmy-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Installazione: memorizza i file base in cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Attivazione: pulisce vecchie cache se presenti
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
    })
  );
  self.clients.claim();
});

// Fetch: serve i file dalla cache o dalla rete
self.addEventListener('fetch', (e) => {
  // Lasciamo passare le chiamate ad Apps Script o API esterne direttamente alla rete
  if (e.request.url.includes('script.google.com') || e.request.url.includes('arasaac.org')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
