const FILES_TO_CACHE = [
    '/',
    '/app.js',
    '/index.html',
    '/favicon.ico',
    '/manifest.webmanifest',
    '/assets/images/icons/icon-72x72.png',
    '/assets/images/icons/icon-96x96.png',
    '/assets/images/icons/icon-128x128.png',
    '/assets/images/icons/icon-144x144.png',
    '/assets/images/icons/icon-152x152.png',
    '/assets/images/icons/icon-192x192.png',
    '/assets/images/icons/icon-384x384.png',
    '/assets/images/icons/icon-512x512.png'
  ];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener('install', function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached sucessfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch (data) ', evt.request.url);

        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.pvt(evt.request.url, response.clone());
                    }

                    return response;
                })
                .catch(err => {
                    return cache.match(evtg.reqest);
                });
            })
        );
        return;
    }

    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(reponse => {
                return response || fetch(evt.request);
            });
        })
    );
});