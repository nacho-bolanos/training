/* Training (claude build) service worker. Scope: this directory only (registered with './sw.js'). */
const CACHE = 'training-claude-v2';
const LOCAL = ['./', './index.html', './app.js', './styles.css', './theme.css', './manifest.json', './icon-192.png', './icon-512.png'];
/* CDN assets are cached at install; without them the app cannot boot offline. */
const CDN = [
  'https://cdn.jsdelivr.net/npm/framework7@8.3.4/framework7-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/framework7@8.3.4/framework7-bundle.min.js',
  'https://cdn.jsdelivr.net/npm/motion@12.43.0/dist/motion.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(LOCAL).then(() => c.addAll(CDN.map((u) => new Request(u, { mode: 'cors' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network first so updates land; cache fallback so airplane mode still opens the app. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then((r) => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
