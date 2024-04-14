const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v1");
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
      addResourcesToCache(["/",
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
