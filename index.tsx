
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ========================================
// REGISTRAR SERVICE WORKER
// ========================================
if ('serviceWorker' in navigator) {
  // Registrar imediatamente, não esperar pelo load
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('✅ Service Worker registrado com sucesso:', registration.scope);
      console.log('📱 Scope:', registration.scope);
      console.log('🌐 Protocolo:', window.location.protocol);
      console.log('🏠 Hostname:', window.location.hostname);
      
      // Verificar se está ativo
      if (registration.active) {
        console.log('✅ Service Worker está ativo');
      }
      if (registration.installing) {
        console.log('⏳ Service Worker está instalando...');
      }
      if (registration.waiting) {
        console.log('⏸️ Service Worker está aguardando...');
      }
      
      // Atualizar automaticamente quando houver nova versão
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('🔄 Estado do Service Worker:', newWorker.state);
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Nova versão do Service Worker disponível');
              // Avisar o usuário que há uma nova versão (opcional)
              if (confirm('Nova versão disponível! Deseja atualizar?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
    })
    .catch((error) => {
      console.error('❌ Erro ao registrar Service Worker:', error);
      console.error('📋 Detalhes:', {
        message: error.message,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        isSecureContext: window.isSecureContext,
      });
      
      // Avisar sobre HTTPS se necessário
      if (window.location.protocol !== 'https:' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1') {
        console.warn('⚠️ Service Worker pode não funcionar sem HTTPS quando acessado via IP');
        console.warn('💡 Solução: Use https:// ou acesse via localhost');
      }
    });
} else {
  console.warn('⚠️ Service Worker não é suportado neste navegador');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Não foi possível encontrar o elemento root para montar o aplicativo");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
