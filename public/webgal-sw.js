// 暂时不用 manifest，目前的 service worker 不是为离线使用配置的

'use strict';

self.importScripts('./worker/include.js');


self.addEventListener('install', (ev) => {
    // console.log('[service worker] installing');
    ev.waitUntil(self.skipWaiting());
});


self.addEventListener('activate', (ev) => {
    // console.log('[service worker] activated');
    ev.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.allSettled(keys.map((k) => {
            // clear ALL caches
            if (k.startsWith(cacheNamePrefix))
                return caches.delete(k);
        }));
        await self.clients.claim();
    })());
});


self.addEventListener('fetch', (ev) => {
    // only cache same site recourses under game/
    const fetchUrl = new URL(ev.request.url);
    if (fetchUrl.origin !== location.origin
        || fetchUrl.pathname.split('/', 2)[1] !== 'game'
        || fetchUrl.searchParams.has('cache-bust')) {
        ev.respondWith(fetch(ev.request));
        return;
    }

    ev.respondWith((async () => {
        const cache = await caches.open(cacheName);
        const cacheResponse = await cache.match(ev.request);
        if (cacheResponse)
            return cacheResponse;
        const netResponse = await fetch(ev.request.clone());
        if (netResponse.status === 200)  // Response().ok is NOT HTTP OK
            await cache.put(ev.request, netResponse.clone());
        return netResponse;
    })());
});
