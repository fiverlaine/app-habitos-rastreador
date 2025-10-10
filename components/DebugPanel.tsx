import React, { useState, useEffect } from 'react';
import { XIcon, ChevronDownIcon, ChevronUpIcon } from './icons';

interface DebugInfo {
  authLoading: boolean;
  authError: string | null;
  user: boolean;
  dataLoading: boolean;
  dataError: string | null;
  isOnline: boolean;
  habitsCount: number;
  currentView: string;
  serviceWorkerReady: boolean;
}

interface DebugPanelProps {
  debugInfo: DebugInfo;
  isVisible: boolean;
  onToggle: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ debugInfo, isVisible, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: boolean | null, error?: string | null) => {
    if (error) return 'text-red-400';
    if (status === null) return 'text-gray-400';
    if (status) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getStatusText = (status: boolean | null, error?: string | null) => {
    if (error) return '❌ Erro';
    if (status === null) return '⚪ N/A';
    if (status) return '✅ OK';
    return '⏳ Loading';
  };

  return (
    <>
      {/* Botão de toggle */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 bg-black/80 text-white p-2 rounded-lg text-xs font-mono"
      >
        🔧 DEBUG
      </button>

      {/* Painel de debug */}
      {isVisible && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">🔧 DEBUG INFO</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-gray-300"
            >
              {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-2">
            {/* Status de conexão */}
            <div className="flex justify-between">
              <span>🌐 Online:</span>
              <span className={getStatusColor(debugInfo.isOnline)}>
                {getStatusText(debugInfo.isOnline)}
              </span>
            </div>

            {/* Service Worker */}
            <div className="flex justify-between">
              <span>⚙️ SW:</span>
              <span className={getStatusColor(debugInfo.serviceWorkerReady)}>
                {getStatusText(debugInfo.serviceWorkerReady)}
              </span>
            </div>

            {/* Autenticação */}
            <div className="flex justify-between">
              <span>🔐 Auth:</span>
              <span className={getStatusColor(!debugInfo.authLoading && !debugInfo.authError, debugInfo.authError)}>
                {debugInfo.authError ? '❌ Erro' : debugInfo.authLoading ? '⏳ Loading' : '✅ OK'}
              </span>
            </div>

            {/* Usuário */}
            <div className="flex justify-between">
              <span>👤 User:</span>
              <span className={getStatusColor(debugInfo.user)}>
                {getStatusText(debugInfo.user)}
              </span>
            </div>

            {/* Dados */}
            <div className="flex justify-between">
              <span>📊 Data:</span>
              <span className={getStatusColor(!debugInfo.dataLoading && !debugInfo.dataError, debugInfo.dataError)}>
                {debugInfo.dataError ? '❌ Erro' : debugInfo.dataLoading ? '⏳ Loading' : '✅ OK'}
              </span>
            </div>

            {/* Hábitos */}
            <div className="flex justify-between">
              <span>📝 Hábitos:</span>
              <span className="text-blue-400">{debugInfo.habitsCount}</span>
            </div>

            {/* View atual */}
            <div className="flex justify-between">
              <span>👁️ View:</span>
              <span className="text-purple-400">{debugInfo.currentView}</span>
            </div>

            {/* Erros detalhados */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                {debugInfo.authError && (
                  <div className="mb-2">
                    <div className="text-red-400 font-bold">🔐 Auth Error:</div>
                    <div className="text-red-300 text-xs break-all">{debugInfo.authError}</div>
                  </div>
                )}
                
                {debugInfo.dataError && (
                  <div className="mb-2">
                    <div className="text-red-400 font-bold">📊 Data Error:</div>
                    <div className="text-red-300 text-xs break-all">{debugInfo.dataError}</div>
                  </div>
                )}

                {/* Informações do navegador */}
                <div className="mt-4">
                  <div className="text-gray-400 font-bold">📱 Browser:</div>
                  <div className="text-gray-300 text-xs">
                    <div>IndexedDB: {('indexedDB' in window) ? '✅' : '❌'}</div>
                    <div>Service Worker: {('serviceWorker' in navigator) ? '✅' : '❌'}</div>
                    <div>Online: {navigator.onLine ? '✅' : '❌'}</div>
                    <div>Storage: {('localStorage' in window) ? '✅' : '❌'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
