/// <reference lib="webworker" />

const CACHE_NAME = 'roastery-cache-v1';
const STATIC_CACHE_NAME = 'roastery-static-v1';
const IMAGE_CACHE_NAME = 'roastery-images-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

const CACHE_STRATEGIES = {
  static: {
    cache: STATIC_CACHE_NAME,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  images: {
    cache: IMAGE_CACHE_NAME,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  api: {
    cache: CACHE_NAME,
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
};

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE_NAME && 
                   name !== IMAGE_CACHE_NAME && 
                   name !== CACHE_NAME;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const {request} = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, CACHE_STRATEGIES.images));
    return;
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, CACHE_STRATEGIES.static));
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, CACHE_STRATEGIES.api));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, CACHE_STRATEGIES.static));
});

function isImageRequest(request: Request): boolean {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(request.url);
}

function isStaticAsset(request: Request, url: URL): boolean {
  return request.destination === 'style' ||
         request.destination === 'script' ||
         request.destination === 'font' ||
         url.pathname.startsWith('/assets/');
}

function isApiRequest(url: URL): boolean {
  return url.pathname.startsWith('/api/');
}

async function cacheFirst(request: Request, strategy: typeof CACHE_STRATEGIES.static): Promise<Response> {
  const cache = await caches.open(strategy.cache);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', {status: 503});
  }
}

async function networkFirst(request: Request, strategy: typeof CACHE_STRATEGIES.api): Promise<Response> {
  const cache = await caches.open(strategy.cache);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({error: 'Offline', message: 'Please check your connection'}), {
      status: 503,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

async function staleWhileRevalidate(request: Request, strategy: typeof CACHE_STRATEGIES.static): Promise<Response> {
  const cache = await caches.open(strategy.cache);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached || new Response('Offline', {status: 503}));

  return cached || fetchPromise;
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({type: 'CACHE_CLEARED'});
        });
      });
    });
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({type: 'window'}).then((clients) => {
      const url = event.notification.data?.url || '/';
      
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});