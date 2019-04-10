self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('Schedule').then(function(cache) {
     return cache.addAll([
       '/',
       '/style.css',
       '/client.js',
       '/manifest.json'
     ]);
   })
 );
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('Schedule').then(function(cache) {
      return cache.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          if (event.request.url.includes('bonch.glitch.me') && !event.request.url.includes('mc.')){
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        return response || fetchPromise;
      })
    })
  );
});
function fromCache(request) {
  return caches.open('Schedule').then(function (cache) { return cache.match(request).then(function (response) {
        return response || fetch(request).then(function(response) {
          return response;
        });
      });
  });
}
