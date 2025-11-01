const CACHE_NAME = 'habitos-app-v1';
// Apenas arquivos locais – evita erros CORS em CDN externos
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.tsx',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta apenas requisições da mesma origem para evitar CORS block
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (new URL(request.url).origin !== self.location.origin) {
    // Deixa o navegador lidar com requisições cross-origin normalmente
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Notification click event - abre o app quando o usuário clica na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event.notification.tag);
  event.notification.close();

  // Abrir ou focar no app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela aberta, focar nela
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não tem janela aberta, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Push notification event (Web Push API)
self.addEventListener('push', (event) => {
  console.log('📬 Push notification recebida');
  
  let notificationData = {
    title: '🎯 Lembrete de Hábito',
    body: 'Você tem um hábito para completar!',
    icon: '/manifest.json',
    badge: '/manifest.json',
    vibrate: [200, 100, 200],
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch (e) {
      console.error('Erro ao parse push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      requireInteraction: false,
      tag: `habit-${notificationData.data.habitId}`,
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event.notification.tag);
});
