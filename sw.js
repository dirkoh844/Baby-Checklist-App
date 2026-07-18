/* Baby List service worker — network-first navigations (fresh deploys reach users),
   stale-while-revalidate for assets/CDNs, notification click focuses the app */
const VERSION = 'babylist-v13';
const CORE = ['./', './index.html', './labor.html', './reminders.html', './settings.html', './upbringing.html', './birthplan.html', './tracker.html', './emergency.html', './assets/app.css', './assets/navbar.css', './assets/enhance.css', './assets/notify.js', './assets/confetti.min.js', './assets/fonts/fraunces-latin-opsz-normal.woff2', './assets/fonts/fraunces-latin-opsz-italic.woff2', './assets/fonts/nunito-sans-latin-normal.woff2', './assets/fonts/nunito-sans-latin-italic.woff2', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './badge-96.png', './icon-mono-512.png'];

self.addEventListener('install', e => {
  /* cache each file on its own: addAll() rejects the entire install if a single
     entry 404s, which silently leaves the app with no offline cache at all */
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.allSettled(CORE.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navigations: network-first so new deploys land immediately; cache fallback offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() =>
        caches.match(req).then(hit => hit || caches.match('./index.html'))
      )
    );
    return;
  }

  // Assets incl. CDN styles/scripts/fonts: stale-while-revalidate
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

self.addEventListener('push', e => {
  let d = { title: 'Baby List', body: 'Reminder' };
  try { if (e.data) d = Object.assign(d, e.data.json()); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, tag: d.tag || 'babylist',
    icon: './icon-192.png', badge: './badge-96.png'
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
