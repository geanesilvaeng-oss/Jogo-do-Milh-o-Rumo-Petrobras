self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('milhao-petrobras-v1').then((cache) => {
      return cache.addAll([
        './index.html',
        './style.css',
        './script.js',
        './perguntas.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
