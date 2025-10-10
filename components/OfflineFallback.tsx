import React from 'react';
import { WifiSlashIcon, ExclamationTriangleIcon } from './icons';

interface OfflineFallbackProps {
  isOnline: boolean;
  hasData: boolean;
  onRetry?: () => void;
}

const OfflineFallback: React.FC<OfflineFallbackProps> = ({ isOnline, hasData, onRetry }) => {
  if (isOnline || hasData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto pb-24">
        <main className="mt-8 space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-orange-400 mb-4">
              <WifiSlashIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Modo Offline</h2>
            <p className="text-slate-400 mb-6">
              Você está offline e não há dados salvos localmente.
            </p>
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-white font-medium mb-2">Para usar offline:</h3>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Faça login quando estiver online</li>
                    <li>• Crie alguns hábitos</li>
                    <li>• Os dados serão salvos localmente</li>
                    <li>• Depois você pode usar offline</li>
                  </ul>
                </div>
              </div>
            </div>

            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-6 bg-teal-500 hover:bg-teal-400 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OfflineFallback;
