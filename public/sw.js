// ========================================
// SERVICE WORKER - APP DE HÁBITOS
// ========================================
// Este Service Worker gerencia:
// 1. Cache de recursos (PWA offline)
// 2. Push notifications (Web Push API)
// 3. Background sync (futuro)

const CACHE_NAME = 'habitos-app-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css'
];

// ========================================
// INSTALAÇÃO - Cachear recursos essenciais
// ========================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache aberto, adicionando recursos...');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('❌ Erro ao adicionar recursos ao cache:', err);
        });
      })
      .then(() => {
        console.log('✅ Service Worker instalado com sucesso');
        return self.skipWaiting(); // Ativar imediatamente
      })
  );
});

// ========================================
// ATIVAÇÃO - Limpar caches antigos
// ========================================
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
      .then(() => {
        console.log('✅ Service Worker ativado');
        return self.clients.claim(); // Controlar todas as páginas imediatamente
      })
  );
});

// ========================================
// FETCH - Estratégia Network First com Cache Fallback
// ========================================
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET ou externas
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta é válida, clonar e adicionar ao cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar, tentar buscar do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
        }
          // Se não tiver no cache, retornar página offline (futuro)
          return new Response('Você está offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// ========================================
// PUSH - Receber e mostrar notificações push
// ========================================
self.addEventListener('push', (event) => {
  console.log('📬 Push notification recebida');
  
  // Dados padrão caso o payload esteja vazio
  let notificationData = {
    title: '🎯 Lembrete de Hábito',
    body: 'Você tem um hábito para completar!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: 'habit-reminder',
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Se houver payload, fazer parse
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 Payload recebido:', payload);
      
      notificationData = {
        ...notificationData,
        ...payload,
        // Garantir que data sempre existe
        data: {
          ...notificationData.data,
          ...(payload.data || {})
        }
      };
    } catch (err) {
      console.error('❌ Erro ao fazer parse do payload:', err);
    }
  }

  // Mostrar a notificação
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      requireInteraction: notificationData.requireInteraction,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icon-192.png'
        }
      ]
    })
  );
});

// ========================================
// NOTIFICATION CLICK - Interagir com notificações
// ========================================
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificação clicada:', event.notification.tag);
  
  const notification = event.notification;
  const action = event.action;
  const notificationData = notification.data || {};

  notification.close();

  // Se clicou em "fechar", apenas fechar
  if (action === 'close') {
    return;
  }

  // Abrir ou focar no app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      // Se já existe uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('🔍 Focando janela existente');
          return client.focus();
        }
      }
      
      // Se não existe janela aberta, abrir uma nova
      if (clients.openWindow) {
        const urlToOpen = notificationData.url || '/';
        console.log('🪟 Abrindo nova janela:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
    .catch((err) => {
      console.error('❌ Erro ao abrir janela:', err);
    })
  );
});

// ========================================
// NOTIFICATION CLOSE - Log quando usuário fecha
// ========================================
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificação fechada pelo usuário:', event.notification.tag);
  
  // Futuro: Enviar analytics sobre notificações fechadas
});

// ========================================
// MESSAGE - Comunicação com o app
// ========================================
self.addEventListener('message', (event) => {
  console.log('💬 Mensagem recebida do app:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('✅ Service Worker carregado - Versão:', CACHE_NAME);
