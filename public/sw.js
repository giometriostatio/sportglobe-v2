const CACHE_NAME = 'sportglobe-v2';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['/']))); self.skipWaiting(); });
self.addEventListener('fetch', e => { if (e.request.url.includes('/api/')) return; e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))); });
