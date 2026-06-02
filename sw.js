const CACHE = 'medara-v9';
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

  // HTML — stale-while-revalidate:
  // Serve do cache imediatamente (sem spinner), atualiza em background
  if (HTML.includes(url.pathname) || url.pathname === '/') {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchAndUpdate = fetch(e.request).then(res => {
            if (res && res.status === 200) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached);

          // Retorna cache imediatamente se disponível, senão aguarda rede
          return cached || fetchAndUpdate;
        })
      )
    );
    return;
  }

  // Assets estáticos — cache-first (imagens/ícones não mudam)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    })
  );
});
