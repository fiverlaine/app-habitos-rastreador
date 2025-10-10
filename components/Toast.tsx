import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon, ExclamationTriangleIcon, InformationCircleIcon } from './icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose, 
  isVisible 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Aguarda animação de saída
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border-green-400 text-white';
      case 'error':
        return 'bg-red-500/90 border-red-400 text-white';
      case 'warning':
        return 'bg-yellow-500/90 border-yellow-400 text-white';
      case 'info':
      default:
        return 'bg-blue-500/90 border-blue-400 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5" />;
      case 'error':
        return <XIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'info':
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
      isAnimating 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-[-100%] opacity-0 scale-95'
    }`}>
      <div className={`${getToastStyles()} rounded-lg px-4 py-3 shadow-lg border backdrop-blur-sm flex items-center gap-3 max-w-sm mx-4`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
