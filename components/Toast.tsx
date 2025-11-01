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
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400/50 text-white shadow-xl shadow-emerald-500/30';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400/50 text-white shadow-xl shadow-red-500/30';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400/50 text-white shadow-xl shadow-amber-500/30';
      case 'info':
      default:
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/50 text-white shadow-xl shadow-cyan-500/30';
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
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
      isAnimating 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-[-100%] opacity-0 scale-95'
    }`}>
      <div className={`${getToastStyles()} rounded-2xl px-5 py-4 shadow-2xl border backdrop-blur-sm flex items-center gap-3 max-w-sm mx-4 animate-slide-up`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <span className="text-sm font-semibold flex-1">{message}</span>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-xl p-1.5 transition-all duration-300 active:scale-90"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
