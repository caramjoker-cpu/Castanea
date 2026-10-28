/* CASTANEA PWA — cache statique de l'interface uniquement.
   Aucune API Supabase, donnée familiale, connexion ou requête météo n'est mise en cache. */
const CACHE = 'castanea-shell-v1.0.0';
const ASSETS = ['./offline.html','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('castanea-shell-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/Castanea/')) return;
  if (req.mode === 'navigate') {
    // Pages toujours demandées au réseau : pas de version HTML périmée.
    event.respondWith(fetch(req).catch(() => caches.match('./offline.html')));
    return;
  }
  if (/\/(icons\/icon-(180|192|512)\.png|manifest\.webmanifest)$/.test(url.pathname)) {
    event.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
