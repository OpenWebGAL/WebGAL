const CACHE_NAME = 'webgal-critical-assets-v3';
const GAME_PREFIX = '/game/';
const CRITICAL_PATHS = ['/game/background/', '/game/figure/', '/game/bgm/', '/game/vocal/', '/game/video/'];
const LOG_PREFIX = '[WebGAL SW]';
const loggedKeys = new Set();

function logOnce(key, ...args) {
  if (loggedKeys.has(key)) return;
  loggedKeys.add(key);
  console.log(LOG_PREFIX, ...args);
}

self.addEventListener('install', (event) => {
  logOnce('install', `install ${CACHE_NAME}`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  logOnce('activate', `activate ${CACHE_NAME}`);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

function isCriticalGameRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (!url.pathname.startsWith(GAME_PREFIX)) return false;
  return CRITICAL_PATHS.some((prefix) => url.pathname.startsWith(prefix));
}

// Stale-while-revalidate: return cached response immediately, then update cache in background.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request.url);

  const fetchAndUpdate = async () => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request.url, response.clone());
      }
      return response;
    } catch (e) {
      return null;
    }
  };

  if (cached) {
    logOnce(`hit:${request.url}`, 'cache hit (revalidating):', new URL(request.url).pathname);
    // Revalidate in background — don't await
    fetchAndUpdate();
    return cached;
  }

  // No cache — must wait for network
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request.url, response.clone());
    logOnce(`cache:${request.url}`, 'cached:', new URL(request.url).pathname);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isCriticalGameRequest(request)) return;

  // Audio/video range requests are passed through to avoid partial-content edge cases.
  if (request.headers.has('range')) {
    logOnce(`range:${request.url}`, 'range passthrough:', new URL(request.url).pathname);
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    staleWhileRevalidate(request).catch(() => {
      return fetch(request);
    }),
  );
});
