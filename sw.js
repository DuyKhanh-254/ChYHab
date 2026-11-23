/* =============================================
   ChYHab — Offline-First Service Worker (PWA)
   Caches core UI, 60-Unit Grammar data, and TTS audio
   ============================================= */
const CACHE_NAME = 'chyhab-pwa-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './css/extra.css',
  './css/upgrade.css',
  './js/data.js',
  './js/app.js',
  './assets/logo.svg',
  './assets/mascots/chy_waving.png',
  './assets/mascots/chy_reading.png',
  './assets/mascots/chy_winner.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Network-first for dynamic assets & API, fallback to cache when offline
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && (url.pathname.startsWith('/api/tts') || url.origin === self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
