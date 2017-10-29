self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('searchstone').then(function(cache) {
     return cache.addAll([
       '/',
       '/index.html',
       '/js/app.js',
       '/app.css',
     ]);
   })
 );
});
