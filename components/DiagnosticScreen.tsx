import React, { useState, useEffect } from 'react';
import { WifiSlashIcon, ExclamationTriangleIcon } from './icons';

interface DiagnosticScreenProps {
  isOnline: boolean;
  onRetry: () => void;
}

const DiagnosticScreen: React.FC<DiagnosticScreenProps> = ({ isOnline, onRetry }) => {
  const [diagnostics, setDiagnostics] = useState({
    indexedDB: false,
    localStorage: false,
    serviceWorker: false,
    hasSession: false
  });

  useEffect(() => {
    // Verificar capacidades do navegador
    const checkCapabilities = () => {
      const newDiagnostics = {
        indexedDB: 'indexedDB' in window,
        localStorage: 'localStorage' in window,
        serviceWorker: 'serviceWorker' in navigator,
        hasSession: !!localStorage.getItem('supabase.auth.session')
      };
      setDiagnostics(newDiagnostics);
    };

    checkCapabilities();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4">
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-orange-400 mb-4">
            <WifiSlashIcon className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isOnline ? '🔧 Diagnóstico' : '📴 Modo Offline'}
          </h1>
          <p className="text-slate-400">
            {isOnline 
              ? 'Verificando capacidades do navegador...' 
              : 'Verificando dados salvos localmente...'
            }
          </p>
        </div>

        {/* Status de conexão */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">🌐 Status de Conexão</h2>
          <div className="flex items-center justify-between">
            <span>Internet:</span>
            <span className={getStatusColor(isOnline)}>
              {getStatusIcon(isOnline)} {isOnline ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Capacidades do navegador */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">📱 Capacidades</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>IndexedDB:</span>
              <span className={getStatusColor(diagnostics.indexedDB)}>
                {getStatusIcon(diagnostics.indexedDB)} {diagnostics.indexedDB ? 'Suportado' : 'Não suportado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>LocalStorage:</span>
              <span className={getStatusColor(diagnostics.localStorage)}>
                {getStatusIcon(diagnostics.localStorage)} {diagnostics.localStorage ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Service Worker:</span>
              <span className={getStatusColor(diagnostics.serviceWorker)}>
                {getStatusIcon(diagnostics.serviceWorker)} {diagnostics.serviceWorker ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sessão salva:</span>
              <span className={getStatusColor(diagnostics.hasSession)}>
                {getStatusIcon(diagnostics.hasSession)} {diagnostics.hasSession ? 'Encontrada' : 'Não encontrada'}
              </span>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium mb-2">
                {isOnline ? 'Para usar offline:' : 'Para resolver:'}
              </h3>
              <ul className="text-sm text-slate-300 space-y-1">
                {isOnline ? (
                  <>
                    <li>• Faça login quando estiver online</li>
                    <li>• Crie alguns hábitos</li>
                    <li>• Os dados serão salvos automaticamente</li>
                    <li>• Depois você pode usar offline</li>
                  </>
                ) : (
                  <>
                    <li>• Conecte-se à internet</li>
                    <li>• Ou faça login se já tem dados salvos</li>
                    <li>• Verifique se o navegador suporta recursos offline</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-teal-500 hover:bg-teal-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🔄 Tentar Novamente
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🔄 Recarregar Página
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 text-center">
          <div className="text-xs text-slate-500">
            <div>PWA: {('serviceWorker' in navigator) ? 'Suportado' : 'Não suportado'}</div>
            <div>User Agent: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticScreen;
