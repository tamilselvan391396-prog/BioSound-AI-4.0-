const CACHE_NAME = "biosound-ai-4-shell-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./web/css/style.css",
  "./web/js/app.js", "./web/js/audio-worklet.js", "./web/js/audio-classifier.js",
  "./web/js/sound-taxonomy.js", "./web/js/event-timeline.js", "./web/js/frequency.js"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key => key.startsWith("biosound-ai-") && key !== CACHE_NAME).map(key => caches.delete(key)))
  ));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
