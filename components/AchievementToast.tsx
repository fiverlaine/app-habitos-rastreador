import React, { useEffect, useState } from 'react';
import type { Achievement } from '../types';
import { TrophyIcon, XIcon, getIconComponent } from './icons';

interface AchievementToastProps {
    achievement: Achievement | null;
    onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [achievement]);

    if (!achievement) return null;

    const IconComponent = getIconComponent(achievement.icon);

    return (
        <div
            className={`fixed bottom-0 right-0 left-0 sm:left-auto sm:bottom-8 sm:right-8 w-full sm:max-w-sm p-4 z-50 transition-all duration-500 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
            role="alert"
            aria-live="assertive"
        >
            <div className="bg-slate-800 border border-amber-400/50 rounded-xl shadow-2xl p-4 flex items-center gap-4">
                <div className="flex-shrink-0 text-amber-400">
                     <TrophyIcon className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-amber-300">Conquista Desbloqueada!</p>
                    <p className="text-slate-200 text-sm">{achievement.name}</p>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 500);
                    }}
                    className="text-slate-400 hover:text-white"
                    aria-label="Fechar notificação"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default AchievementToast;
