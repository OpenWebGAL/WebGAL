self.addEventListener('fetch', function (event) {
  event.respondWith(
    // 从缓存中找资源
    caches.match(event.request).then(function (resp) {
      return (
        resp ||
        fetch(event.request).then(function (response) {
          console.log('Request New Assets');
          // eslint-disable-next-line max-nested-callbacks
          return caches.open('v1').then(function (cache) {
            // eslint-disable-next-line max-nested-callbacks
            cache.put(event.request, response.clone()).then(() => console.log('New Cache Put'));
            return response;
          });
        })
      );
    }),
  );
});
