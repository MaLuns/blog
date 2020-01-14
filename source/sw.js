/* self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('sw_demo').then(function (cache) {
            return cache.addAll([
                '/css/style.css',
                '/js/index.min.js'
            ])
        }));
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
}); */



"use strict";
(function () {
    var cacheVersion = "20200114";
    var staticImageCacheName = "image" + cacheVersion;
    var staticAssetsCacheName = "assets" + cacheVersion;
    var contentCacheName = "content" + cacheVersion;

    var maxEntries = 100;
    self.importScripts("lib/sw-toolbox/sw-toolbox.js");
    self.toolbox.options.debug = false;
    self.toolbox.options.networkTimeoutSeconds = 3;

    self.toolbox.router.get("/images/(.*)", self.toolbox.cacheFirst, {
        cache: {
            name: staticImageCacheName,
            maxEntries: maxEntries
        }
    });

    self.toolbox.router.get('/js/(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: staticAssetsCacheName,
            maxEntries: maxEntries
        }
    });
    self.toolbox.router.get('/css/(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: staticAssetsCacheName,
            maxEntries: maxEntries
        }
    });
    self.toolbox.router.get('/fonts/(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: staticAssetsCacheName,
            maxEntries: maxEntries
        }
    });

    self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
        origin: /cdn\.jsdelivr\.net/,
        cache: {
            name: staticAssetsCacheName,
            maxEntries: maxEntries
        }
    });

    self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
        origin: /busuanzi\.ibruce\.info/,
        cache: {
            name: staticAssetsCacheName,
            maxEntries: maxEntries
        }
    })

    self.toolbox.router.get('/*', self.toolbox.networkFirst, {
        cache: {
            name: contentCacheName,
            maxEntries: maxEntries
        }
    });

    self.addEventListener("install", function (event) {
        return event.waitUntil(self.skipWaiting())
    });
    self.addEventListener("activate", function (event) {
        return event.waitUntil(self.clients.claim())
    })
})();