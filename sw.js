// Service Worker di CAArmy
// Gestisce la cache dell'app "shell" (HTML, manifest, icone) per il
// funzionamento offline e per soddisfare i requisiti di installabilità PWA.
// NON mette in cache le chiamate all'API Apps Script: quelle devono
// sempre restare fresche, dato che dipendono da cosa scrive l'utente.

const CACHE_NAME = 'caarmy-cache-v1';

const URLS_DA_METTERE_IN_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS_DA_METTERE_IN_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomiCache) {
      return Promise.all(
        nomiCache
          .filter(function (nome) { return nome !== CACHE_NAME; })
          .map(function (nome) { return caches.delete(nome); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // Le chiamate verso l'API Apps Script (ricerca simboli, alternative)
  // e verso ARASAAC non vanno mai servite dalla cache: devono essere
  // sempre in tempo reale.
  if (url.indexOf('script.google.com') !== -1 ||
      url.indexOf('arasaac.org') !== -1) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (rispostaCache) {
      return rispostaCache || fetch(event.request);
    })
  );
});
