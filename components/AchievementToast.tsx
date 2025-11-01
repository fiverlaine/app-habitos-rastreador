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
                isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'
            }`}
            role="alert"
            aria-live="assertive"
        >
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-600/10 to-yellow-600/10 backdrop-blur-xl border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-500/20 p-5 flex items-center gap-4 animate-slide-up">
                <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
                        <TrophyIcon className="w-7 h-7 text-white" />
                    </div>
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-amber-300 mb-1">Conquista Desbloqueada!</p>
                    <p className="text-white text-sm font-medium">{achievement.name}</p>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 500);
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                    aria-label="Fechar notificação"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default AchievementToast;
