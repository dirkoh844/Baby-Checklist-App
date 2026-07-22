/* Baby List service worker — static shell only. API, authenticated, no-store,
   and cross-origin requests always bypass CacheStorage. */
const VERSION = 'babylist-v320';
const CACHE_PREFIX = 'babylist-';
const CORE = [
  './', './index.html', './labor.html', './reminders.html', './settings.html',
  './upbringing.html', './birthplan.html', './tracker.html', './emergency.html',
  './sources.html', './assets/app.css', './assets/navbar.css?v=3.2.0',
  './assets/enhance.css?v=3.2.0', './assets/state-core.js?v=3.2.0',
  './assets/sync-core.js?v=3.2.0', './assets/tracker-core.js?v=3.2.0', './assets/app-shell.js?v=3.2.0',
  './assets/notify.js?v=3.2.0', './assets/confetti.min.js',
  './assets/fonts/fraunces-latin-opsz-normal.woff2',
  './assets/fonts/fraunces-latin-opsz-italic.woff2',
  './assets/fonts/nunito-sans-latin-normal.woff2',
  './assets/fonts/nunito-sans-latin-italic.woff2', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './badge-96.png', './icon-mono-512.png'
];
const STATIC_PATHS = new Set(CORE.map(x => new URL(x, self.location.href).pathname));

self.addEventListener('install', event => {
  /* Add each file on its own. addAll() rejects the whole install if a single
     entry 404s (e.g. a partial deploy where one asset was missed), which would
     silently leave the app with no offline cache at all. allSettled keeps
     whatever succeeded. */
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => Promise.allSettled(CORE.map(u => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.cache === 'no-store' || req.headers.has('Authorization')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) event.waitUntil(caches.open(VERSION).then(cache => cache.put(req, res.clone())));
        return res;
      }).catch(async () => (await caches.match(req)) || (await caches.match('./index.html')))
    );
    return;
  }

  if (!STATIC_PATHS.has(url.pathname)) return;
  event.respondWith(
    caches.match(req).then(hit => {
      const network = fetch(req).then(res => {
        if (res && res.ok) event.waitUntil(caches.open(VERSION).then(cache => cache.put(req, res.clone())));
        return res;
      }).catch(() => hit);
      return hit || network;
    })
  );
});

self.addEventListener('push', event => {
  let data = { title: 'Baby List', body: 'Reminder', url: './reminders.html' };
  try { if (event.data) data = Object.assign(data, event.data.json()); } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, tag: data.tag || 'babylist', data: { url: data.url || './reminders.html' },
    icon: './icon-192.png', badge: './badge-96.png'
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './reminders.html', self.location.href).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const client of list) {
      if (client.url === target && 'focus' in client) return client.focus();
    }
    return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
  }));
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'CLEAR_PRIVATE_DATA') return;
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /private|api|cloud/i.test(k)).map(k => caches.delete(k)))));
});
