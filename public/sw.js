const CACHE_NAME = 'habitos-app-v4';
const DATA_CACHE_NAME = 'habitos-data-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Assets serão cacheados dinamicamente
];

// Lista de assets críticos para cache
const criticalAssets = [
  '/assets/index.css',
  '/assets/index.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Install event - Cache recursos críticos
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache aberto');
        // Cache apenas recursos básicos primeiro
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('🚀 Cache inicial concluído');
        // Cache assets críticos em background
        return caches.open(CACHE_NAME).then(cache => {
          return Promise.allSettled(
            criticalAssets.map(url => 
              fetch(url).then(response => {
                if (response.ok) {
                  cache.put(url, response);
                  console.log('📦 Asset cacheado:', url);
                }
              }).catch(error => {
                console.log('⚠️ Erro ao cachear asset:', url, error);
              })
            )
          );
        });
      })
      .then(() => {
        console.log('🚀 Service Worker pronto');
        return self.skipWaiting(); // Força ativação imediata
      })
  );
});

// Activate event - Limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker ativo');
      return self.clients.claim(); // Toma controle de todas as abas
    })
  );
});

// Fetch event - Estratégia de cache inteligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Estratégia para APIs do Supabase
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(handleSupabaseRequest(request));
    return;
  }

  // Estratégia para assets estáticos
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Estratégia para páginas HTML
  if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
    return;
  }

  // Estratégia padrão: Network First
  event.respondWith(handleDefaultRequest(request));
});

// Função para requisições do Supabase (Network First com cache)
async function handleSupabaseRequest(request) {
  try {
    console.log('🌐 Tentando requisição Supabase online:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache da resposta para uso offline
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, response.clone());
      console.log('💾 Dados salvos no cache offline');
    }
    
    return response;
  } catch (error) {
    console.log('📴 Offline - Buscando no cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('✅ Dados encontrados no cache offline');
      return cachedResponse;
    }
    
    // Retorna resposta offline genérica se não há cache
    return new Response(
      JSON.stringify({ 
        error: 'Sem conexão', 
        offline: true,
        message: 'Dados não disponíveis offline' 
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Função para assets estáticos (Cache First)
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('❌ Erro ao buscar asset:', request.url);
    return new Response('Asset não disponível offline', { status: 404 });
  }
}

// Função para documentos HTML (Network First)
async function handleDocumentRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cachedResponse = await caches.match('/index.html');
    return cachedResponse || new Response('Página não disponível offline', { status: 404 });
  }
}

// Função padrão (Network First)
async function handleDefaultRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Recurso não disponível offline', { status: 404 });
  }
}

// Verifica se é um asset estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf'];
  const pathname = url.pathname.toLowerCase();
  
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         url.hostname.includes('cdn.tailwindcss.com') ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

// Background Sync para sincronização quando voltar online
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync iniciado:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sincronizar dados offline quando voltar online
async function syncOfflineData() {
  console.log('🔄 Sincronizando dados offline...');
  // Implementar lógica de sincronização aqui
  // Será integrado com o sistema de dados offline
}

// Notificação para usuário quando voltar online
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
