const CACHE = 'spinnit-v2';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/assets/style.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/tools/',
  '/tools/random-number.html',
  '/tools/dice-roller.html',
  '/tools/coin-flip.html',
  '/tools/team-picker.html',
  '/tools/yes-no-wheel.html',
  '/tools/colour-generator.html',
  '/tools/password-generator.html',
  '/tools/lottery-picker.html',
  '/tools/percentage-generator.html',
  '/tools/list-shuffler.html',
  '/tools/random-winner-picker.html',
  '/tools/wheel-of-names.html',
  '/tools/random-country.html',
  '/tools/random-name-generator.html',
  '/tools/dice/',
  '/tools/classroom/',
  '/tools/giveaway/',
  '/tools/decision-makers/',
  '/tools/password-security/',
  '/blog/',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.resolve()
      .then(() => self.registration.navigationPreload ? self.registration.navigationPreload.enable() : undefined)
      .then(() => caches.keys())
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

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
