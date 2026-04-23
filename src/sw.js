const CACHE = 'randomtools-v1';
const ASSETS = [
  '/randomtools/',
  '/randomtools/index.html',
  '/randomtools/assets/style.css',
  '/randomtools/manifest.json',
  '/randomtools/tools/random-number.html',
  '/randomtools/tools/dice-roller.html',
  '/randomtools/tools/coin-flip.html',
  '/randomtools/tools/team-picker.html',
  '/randomtools/tools/yes-no-wheel.html',
  '/randomtools/tools/colour-generator.html',
  '/randomtools/tools/password-generator.html',
  '/randomtools/tools/lottery-picker.html',
  '/randomtools/tools/percentage-generator.html',
  '/randomtools/tools/list-shuffler.html',
  '/randomtools/tools/wheel-of-names.html',
  '/randomtools/tools/random-country.html',
  '/randomtools/tools/random-name-generator.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only cache same-origin GET requests
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
