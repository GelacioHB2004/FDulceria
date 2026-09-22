/* ================================================================
   Service Worker — Dulcería Angelitos
   Estrategia: Cache-First para assets, Network-First para navegación
   ✅ NO cachea /api/* → datos siempre frescos del backend
   ================================================================ */

const CACHE_NAME = 'dulceria-angelitos-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/login-bg.webp',
  '/logo192.png',
  '/logo512.png',
  '/Logoss.jpg',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] No se pudo pre-cachear algún asset:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    url.hostname === 'backenddulceria.onrender.com' ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    try {
      const networkResponse = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      return caches.match(OFFLINE_URL);
    }
  }

  const cached = await caches.match(request);
  if (cached) {
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
      }
    }).catch(() => {});
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Sin conexión', { status: 503, statusText: 'Service Unavailable' });
  }
}
