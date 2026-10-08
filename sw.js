/* Service Worker - GP Distribuciones (offline) */
const VERSION = 'v5';
const CACHE_STATIC = 'gp-static-' + VERSION;
const CACHE_RUNTIME = 'gp-runtime-' + VERSION;

const CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_STATIC);
    await cache.addAll(APP_SHELL);
    // Chart.js (CDN): se guarda como respuesta opaca; si falla no bloquea la instalación
    try { await cache.add(new Request(CHART_CDN, { mode: 'no-cors' })); } catch (e) {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => ![CACHE_STATIC, CACHE_RUNTIME].includes(k)).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // POST (Overpass) pasa directo a la red

  const url = new URL(req.url);

  // Navegación: red primero, si falla -> app guardada
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_STATIC);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  // Archivos propios y Chart.js: caché primero, actualiza en segundo plano
  if (url.origin === self.location.origin || req.url.startsWith(CHART_CDN)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const network = fetch(req).then(async (res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const cache = await caches.open(CACHE_RUNTIME);
          cache.put(req, res.clone());
        }
        return res;
      }).catch(() => null);
      return cached || (await network) || Response.error();
    })());
    return;
  }

  // Otros recursos externos (mapas, etc.): red, con respaldo en caché
  event.respondWith(
    fetch(req).then(async (res) => {
      if (res && (res.ok || res.type === 'opaque')) {
        const cache = await caches.open(CACHE_RUNTIME);
        cache.put(req, res.clone());
      }
      return res;
    }).catch(() => caches.match(req))
  );
});
