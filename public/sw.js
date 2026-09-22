/* ================================================================
   Service Worker - Dulceria Angelitos
   - Network-first para navegacion de la SPA
   - Stale-while-revalidate para assets estaticos
   - No cachea /api ni el backend: datos siempre frescos
   ================================================================ */

const CACHE_VERSION = 'v2';
const APP_CACHE = `dulceria-angelitos-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/Logoss.jpg',
  '/login-bg.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(cleanOldCaches());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;
  if (shouldBypassCache(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(handleStaticAsset(request));
});

async function precacheAppShell() {
  const cache = await caches.open(APP_CACHE);

  await Promise.all(
    PRECACHE_ASSETS.map(async (asset) => {
      try {
        const response = await fetch(asset, { cache: 'reload' });
        if (response.ok) {
          await cache.put(asset, response);
        }
      } catch (error) {
        console.warn('[SW] No se pudo precachear:', asset, error);
      }
    })
  );
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName.startsWith('dulceria-angelitos-') && cacheName !== APP_CACHE)
      .map((cacheName) => caches.delete(cacheName))
  );
}

function shouldBypassCache(url) {
  return (
    url.origin === 'https://backenddulceria.onrender.com' ||
    url.pathname.startsWith('/api/')
  );
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(APP_CACHE);
    await cache.put(request, response.clone());
    return response;
  } catch {
    const cachedRoute = await caches.match(request);
    if (cachedRoute) return cachedRoute;

    const cachedHome = await caches.match('/');
    if (cachedHome) return cachedHome;

    return caches.match(OFFLINE_URL);
  }
}

async function handleStaticAsset(request) {
  const cached = await caches.match(request);

  if (cached) {
    fetch(request)
      .then(async (response) => {
        if (response && response.ok && response.type !== 'opaque') {
          const cache = await caches.open(APP_CACHE);
          await cache.put(request, response.clone());
        }
      })
      .catch(() => {});

    return cached;
  }

  try {
    const response = await fetch(request);

    if (response && response.ok && response.type !== 'opaque') {
      const cache = await caches.open(APP_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const fallback = await caches.match(OFFLINE_URL);
    return fallback || new Response('Sin conexion', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}
