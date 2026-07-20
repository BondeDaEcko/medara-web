const CACHE = 'medara-v15';
const STATIC = ['/coracao.png', '/letras.png', '/medara-logo.jpg', '/icons/icon-192.png', '/icons/icon-512.png', '/manifest.json'];
const HTML   = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([...HTML, ...STATIC])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Só intercepta requests do mesmo domínio — CDNs e APIs externas vão direto
  if (url.origin !== self.location.origin) return;

  // HTML — stale-while-revalidate: serve cache imediatamente, atualiza em background
  if (HTML.includes(url.pathname) || url.pathname === '/') {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const networkFetch = fetch(e.request)
            .then(res => {
              if (res && res.status === 200) cache.put(e.request, res.clone());
              return res;
            })
            .catch(() => cached);

          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Assets estáticos (imagens, ícones) — cache-first
  if (STATIC.some(s => url.pathname === s)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        });
      })
    );
  }
});
