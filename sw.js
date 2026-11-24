const CACHE_NAME = "biosound-ai-4-pwa-v7";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./style.css",
  "./app.js",
  "./audio-classifier.js",
  "./audio-worklet.js",
  "./sound-taxonomy.js",
  "./event-timeline.js",
  "./frequency.js",
  "./biosound-icon-192.png",
  "./biosound-icon-512.png"
];

// Install application files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// Activate and remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith("biosound-ai-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Handle application requests
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Always try the network first for page navigation
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache =>
              cache.put("./index.html", copy)
            );
          }

          return response;
        })
        .catch(async () => {
          return (
            await caches.match(request)
          ) || (
            await caches.match("./index.html")
          );
        })
    );

    return;
  }

  // Use cached files when available
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(request);
    })
  );
});

