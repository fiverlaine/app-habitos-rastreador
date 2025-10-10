import React, { useState, useEffect } from 'react';
import { WifiIcon, WifiSlashIcon } from './icons';

interface OfflineStatusProps {
  isOnline: boolean;
  isSyncing?: boolean;
}

const OfflineStatus: React.FC<OfflineStatusProps> = ({ isOnline, isSyncing = false }) => {
  const [showStatus, setShowStatus] = useState(false);
  const [wasOffline, setWasOffline] = useState(!isOnline);

  useEffect(() => {
    // Mostrar status quando mudar de offline para online ou vice-versa
    if (wasOffline !== !isOnline) {
      setShowStatus(true);
      setWasOffline(!isOnline);
      
      // Esconder após 4 segundos
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Não mostrar se está online e não está sincronizando
  if (isOnline && !isSyncing && !showStatus) {
    return null;
  }

  const getStatusInfo = () => {
    if (isSyncing) {
      return {
        icon: <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />,
        text: 'Sincronizando...',
        bgColor: 'bg-blue-500/90',
        borderColor: 'border-blue-400',
        textColor: 'text-white'
      };
    }
    
    if (isOnline) {
      return {
        icon: <WifiIcon className="w-4 h-4" />,
        text: 'Conectado',
        bgColor: 'bg-green-500/90',
        borderColor: 'border-green-400',
        textColor: 'text-white'
      };
    }
    
    return {
      icon: <WifiSlashIcon className="w-4 h-4" />,
      text: 'Modo Offline',
      bgColor: 'bg-orange-500/90',
      borderColor: 'border-orange-400',
      textColor: 'text-white'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
      showStatus || isSyncing || !isOnline 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-[-100%] opacity-0 scale-95'
    }`}>
      <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 max-w-sm mx-4`}>
        <div className="flex-shrink-0">
          {statusInfo.icon}
        </div>
        <span className={`${statusInfo.textColor} text-sm font-medium`}>
          {statusInfo.text}
        </span>
      </div>
    </div>
  );
};

export default OfflineStatus;
