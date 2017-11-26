var CACHE_NAME = 'searchstone-cache';
var urlsToCache = [
  '/',
  '/index.html',
  '/app.css',
  '/js/app.js',
  '/js/sunwell.js',
  '/fonts/Belwe.ttf',
  '/fonts/Belwe.woff',
  '/fonts/Belwe.woff2',
  '/img/1px-transparent.png',
  '/img/attack.svg',
  '/img/back-loading.png',
  '/img/cardback-legendrank.png',
  '/img/ClassHeaders.png',
  '/img/classIcons.svg',
  '/img/common.svg',
  '/img/cristal--active.svg',
  '/img/cristal.svg',
  '/img/dust.png',
  '/img/epic.svg',
  '/img/free.svg',
  '/img/health.svg',
  '/img/icon-collapse.svg',
  '/img/icon-expand.svg',
  '/img/legendary.svg',
  '/img/logo-instantsearch.svg',
  '/img/og_screen.png',
  '/img/powered-by-algolia.svg',
  '/img/rare.svg',
  '/img/ripple.svg',
  '/img/searchstone.svg',
  '/img/setIcons.svg',
  '/img/shield.svg',
  '/img/swords.svg',
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      // Cache hit - return response
      if (response) {
        console.log("match cache", response);
        return response;
      }

      // IMPORTANT: Clone the request. A request is a stream and
      // can only be consumed once. Since we are consuming this
      // once by cache and once by the browser for fetch, we need
      // to clone the response.
      var fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(
        function(response) {
          // Check if we received a valid response
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }
      );
    })
  );
});
