/* ================================================================
   Service Worker Avanzado - Dulcería Angelitos (PWA)
   - Cacheo completo de App Shell (HTML, CSS, JS, Iconos, Manifiesto)
   - Soporte SPA Offline: rutas renderizan con index.html en caché
   - Cacheo de API GET (Productos, Catálogo, Inicio, Promociones, etc.)
   - Cacheo de imágenes y recursos estáticos
   - Manejo seguro de modo sin conexión sin pantallas blancas
   ================================================================ */

const CACHE_VERSION = 'v3';
const CACHE_STATIC = `angelitos-static-${CACHE_VERSION}`;
const CACHE_DATA = `angelitos-data-${CACHE_VERSION}`;
const CACHE_IMAGES = `angelitos-images-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline.html';

// Recursos críticos para arrancar la aplicación sin conexión
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/Logoss.jpg',
  '/login-bg.webp',
  '/login-bg.png'
];

/* ── 1. Instalación: Precarga el App Shell ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(async (cache) => {
      console.log('[SW] Precachando App Shell...');
      // Usamos fetch individual para que si un recurso no existe, no cancele los demás
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { cache: 'reload' });
            if (response.ok) {
              await cache.put(asset, response);
            }
          } catch (err) {
            console.warn('[SW] No se pudo precachear:', asset, err);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

/* ── 2. Activación: Limpieza de cachés antiguas ── */
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_STATIC, CACHE_DATA, CACHE_IMAGES];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !currentCaches.includes(key))
          .map((key) => {
            console.log('[SW] Eliminando caché obsoleta:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

/* ── 3. Intercepción de Peticiones (Fetch) ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptamos HTTP y HTTPS
  if (!['http:', 'https:'].includes(url.protocol)) return;

  // Las peticiones de modificación (POST, PUT, DELETE, PATCH) SIEMPRE van a la red
  if (request.method !== 'GET') {
    return;
  }

  // A) NAVEGACIÓN EN LA SPA (cuando el usuario entra o recarga rutas como /productos, /cliente, etc.)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // B) PETICIONES A LA API (GET) - Productos, Catálogo, Categorías, Promociones, Inicio, etc.
  const isApi =
    url.pathname.startsWith('/api/') ||
    url.origin.includes('backenddulceria.onrender.com') ||
    (url.port === '3000' && url.pathname.startsWith('/api'));

  if (isApi) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // C) IMÁGENES (locales o externas de productos)
  const isImage =
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|webp|svg|gif|ico|avif)(\?.*)?$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // D) ARCHIVOS ESTÁTICOS (JS Chunks, CSS, Fuentes)
  event.respondWith(handleStaticAsset(request));
});

/* ── Estrategia A: Navegación SPA (Network-First con fallback a index.html) ── */
async function handleNavigation(request) {
  try {
    // Intenta red primero para traer la versión más fresca
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, networkResponse.clone());
      // También refrescamos la entrada de /index.html
      cache.put('/index.html', networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Modo offline en navegación:', request.url);
  }

  // Fallback offline:
  // 1. Si la ruta exacta ya fue visitada y guardada en caché
  const cachedMatch = await caches.match(request);
  if (cachedMatch) return cachedMatch;

  // 2. En una SPA, cualquier ruta de navegación debe servir el App Shell (index.html)
  // para que React Router tome el control y renderice la vista adecuada offline
  const appShell =
    (await caches.match('/index.html')) ||
    (await caches.match('/'));

  if (appShell) return appShell;

  // 3. Como último recurso, la página de aviso offline
  const offlinePage = await caches.match(OFFLINE_URL);
  return offlinePage || new Response('Sin conexión', { status: 503, statusText: 'Offline' });
}

/* ── Estrategia B: Peticiones API (Network-First con Caché Fallback) ── */
async function handleApiRequest(request) {
  try {
    // Intentar ir a la red
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      // Guardar copia fresca en la caché de datos
      const cache = await caches.open(CACHE_DATA);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    return networkResponse;
  } catch (error) {
    // Sin internet o error de red: consultar la caché de datos
    console.log('[SW] Recuperando datos de API desde la caché para:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Devolver los datos cacheados con cabecera informativa
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Angelitos-Cache', 'HIT-OFFLINE');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }

    // Si no estaba en caché, devolver respuesta JSON limpia en vez de romper la UI
    return new Response(
      JSON.stringify({
        exito: false,
        offline: true,
        mensaje: 'Sin conexión a internet y sin datos guardados previamente en caché.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/* ── Estrategia C: Imágenes (Cache-First con Network Fallback) ── */
async function handleImageRequest(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
      const cache = await caches.open(CACHE_IMAGES);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // Retornar logo pre-cachead si falla
    const fallbackLogo = await caches.match('/logo192.png');
    if (fallbackLogo) return fallbackLogo;
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}

/* ── Estrategia D: Archivos Estáticos (Stale-While-Revalidate) ── */
async function handleStaticAsset(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
        const cache = await caches.open(CACHE_STATIC);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  // Si ya lo tenemos en caché, devolverlo inmediatamente y actualizar en segundo plano
  if (cached) {
    return cached;
  }

  // Si no está en caché, esperar la respuesta de red
  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;

  return new Response('Recurso no disponible offline', {
    status: 404,
    statusText: 'Not Found'
  });
}
