const CACHE = 'training.codex.assets.v1';
const CDN = [
  'https://cdn.jsdelivr.net/npm/framework7@8.3.4/framework7-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/framework7@8.3.4/framework7-bundle.min.js',
  'https://cdn.jsdelivr.net/npm/motion@12.36.0/dist/motion.js'
];
const LOCAL = ['./', './index.html', './app.js', './styles.css', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  // CORS requests make failures visible: never declare offline-ready with missing libraries.
  await cache.addAll([...LOCAL, ...CDN].map(url => new Request(new URL(url, self.location), {mode:'cors', cache:'reload'})));
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('training.codex.assets.') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || (!url.href.startsWith(self.registration.scope) && !CDN.includes(url.href))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (!response.ok) throw new Error('Network response failed');
      await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') return cache.match(new URL('./index.html', self.registration.scope));
      throw error;
    }
  })());
});
