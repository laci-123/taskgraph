const updateCache = async (resources) => {
    const cache_keys = await caches.keys();
    for(const key of cache_keys) {
        caches.delete(key);
    }
    
    const cache = await caches.open("v3");
    await cache.addAll(resources);
};

const cacheFirst = async (request) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    return fetch(request);
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        updateCache(["/",
                     "/index.html",
                     "/bundle.js",
                     "css/default.css",
                     "img/logo192x192.png",
                     "img/logo512x512.png"]),
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(cacheFirst(event.request));
});
