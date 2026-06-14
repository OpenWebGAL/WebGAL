const CACHE_PREFIX = 'webgal-';
const CACHE_NAME = 'webgal-build-assets-v1';
const LOG_PREFIX = '[WebGAL SW]';
const HASHED_BUILD_ASSET_RE = /(^|\/)assets\/[^/?#]+-[A-Za-z0-9_-]{8,}\.(?:js|css|ttf|woff|woff2)$/;
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
      await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

function isHashedBuildAssetRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return HASHED_BUILD_ASSET_RE.test(url.pathname);
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    logOnce(`hit:${request.url}`, 'cache hit:', new URL(request.url).pathname);
    return cached;
  }

  const response = await fetch(request);
  if (response.ok && response.status === 200) {
    await cache.put(request, response.clone());
    logOnce(`cache:${request.url}`, 'cached:', new URL(request.url).pathname);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isHashedBuildAssetRequest(request)) return;

  event.respondWith(
    cacheFirst(request).catch(() => {
      return fetch(request);
    }),
  );
});
