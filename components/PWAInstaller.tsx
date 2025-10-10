import React, { useEffect, useState } from 'react';
import { PlusIcon, XIcon } from './icons';

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado com sucesso:', registration);
          
          // Verificar se há atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 Nova versão disponível!');
                  // Opcional: mostrar notificação de atualização
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error);
        });
    }

    // Detectar prompt de instalação
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar se já foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA instalado com sucesso!');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
    });

    // Verificar se já está instalado (para PWA)
    const checkIfInstalled = () => {
      // Verifica se está rodando em modo standalone (instalado)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Ou se foi adicionado à tela inicial no iOS
      const isIOSInstalled = (window.navigator as any).standalone === true;
      
      if (isStandalone || isIOSInstalled) {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
    };

    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`✅ Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Não mostrar se já está instalado ou se não há prompt
  if (isInstalled || !showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-slate-800 border border-teal-500/50 rounded-xl p-4 shadow-2xl z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <PlusIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">Instalar App</h3>
            <p className="text-slate-400 text-sm">Adicione à tela inicial</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="text-slate-400 hover:text-white"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller;
