self.addEventListener('install', (ev) => {
  // console.log('[service worker] installing');
  ev.waitUntil(self.skipWaiting());
});

// fetch事件是每次页面请求资源时触发的
self.addEventListener('fetch', function (event) {
  const url = event.request.url;
  const isReturnCache = !!(url.match('/assets/') && !url.match('game'));
  if (isReturnCache) {
    // console.log('%cCACHED: ' + url, 'color: #005CAF; padding: 2px;');
  }
  if (!isReturnCache) {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      // 检查在缓存中是否有匹配的资源
      caches.match(event.request).then(function (response) {
        // 如果缓存中有匹配的资源，则返回缓存资源
        if (response) {
          return response;
        }
        // 如果没有匹配的资源，则尝试从网络请求
        // 同时将获取的资源存入缓存
        return fetch(event.request)
          .then(function (networkResponse) {
            console.log('%cCACHED: ' + url, 'color: #005CAF; padding: 2px;');
            if (networkResponse.status === 206 && event.request.headers.has('range')) {
              // 如果是部分响应且请求带有Range头，则创建新的请求，将完整响应返回给客户端
              // eslint-disable-next-line max-nested-callbacks
              return fetch(event.request.url).then(function (fullNetworkResponse) {
                const headers = {};
                for (let entry of fullNetworkResponse.headers.entries()) {
                  headers[entry[0]] = entry[1];
                }
                const fullResponse = new Response(fullNetworkResponse.body, {
                  status: fullNetworkResponse.status,
                  statusText: fullNetworkResponse.statusText,
                  headers: headers,
                });
                const clonedResponse = fullResponse.clone();
                // eslint-disable-next-line max-nested-callbacks
                caches.open('my-cache').then(function (cache) {
                  cache.put(event.request, clonedResponse);
                });
                return fullResponse;
              });
            }
            const clonedResponse = networkResponse.clone();
            // eslint-disable-next-line max-nested-callbacks
            caches.open('my-cache').then(function (cache) {
              cache.put(event.request, clonedResponse);
            });
            return networkResponse;
          })
          .catch(function (error) {
            console.error('Fetching failed:', error);
            throw error;
          });
      }),
    );
  }
});
