/* Training (claude build) service worker. Scope: this directory only (registered with './sw.js'). */
const CACHE = 'training-claude-v5';
const LOCAL = ['./', './index.html', './app.js', './styles.css', './theme.css', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './apple-touch-icon-167.png', './apple-touch-icon-152.png', './apple-touch-icon-120.png',
  './figures/arms-1.svg', './figures/arms-2.svg', './figures/arms-3.svg', './figures/arms-4.svg', './figures/arms-5.svg', './figures/arms-6.svg', './figures/bench-1.svg', './figures/bench-2.svg', './figures/bench-3.svg', './figures/bss-1.svg', './figures/bss-2.svg', './figures/bss-3.svg', './figures/deadbug-1.svg', './figures/deadbug-2.svg', './figures/deadbug-3.svg', './figures/facepull-1.svg', './figures/facepull-2.svg', './figures/facepull-3.svg', './figures/goblet-1.svg', './figures/goblet-2.svg', './figures/goblet-3.svg', './figures/plank-1.svg', './figures/plank-2.svg', './figures/plank-3.svg', './figures/press-1.svg', './figures/press-2.svg', './figures/press-3.svg', './figures/pulldown-1.svg', './figures/pulldown-2.svg', './figures/pulldown-3.svg', './figures/rdl-1.svg', './figures/rdl-2.svg', './figures/rdl-3.svg', './figures/row-1.svg', './figures/row-2.svg', './figures/row-3.svg', './figures/stepup-1.svg', './figures/stepup-2.svg', './figures/stepup-3.svg', './figures/walk-1.svg', './figures/walk-2.svg', './figures/walk-3.svg'];
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
