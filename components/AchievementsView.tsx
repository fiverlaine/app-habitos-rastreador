import React from 'react';
import { achievementsList } from '../utils/achievements';
import { getIconComponent, LockClosedIcon, TrophyIcon } from './icons';

interface AchievementsViewProps {
    unlockedAchievementIds: Set<string>;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ unlockedAchievementIds }) => {
    const unlockedCount = unlockedAchievementIds.size;
    const totalCount = achievementsList.length;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="mb-6 px-1">
                <h1 className="text-2xl font-bold text-white mb-1">Conquistas</h1>
                <p className="text-sm text-slate-500">Suas realizações e marcos</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 via-orange-600/10 to-yellow-600/10 backdrop-blur-sm rounded-3xl p-6 border border-amber-500/20 shadow-xl">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                        <TrophyIcon className="w-10 h-10 text-white" />
                    </div>
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Conquistas</h2>
                    <p className="text-slate-400 mb-4">Você desbloqueou <span className="font-bold text-amber-400">{unlockedCount}</span> de <span className="font-bold text-white">{totalCount}</span> conquistas.</p>
                    <div className="w-full bg-slate-800/80 rounded-full h-3 max-w-md mx-auto overflow-hidden shadow-inner">
                        <div
                            className="bg-gradient-to-r from-amber-500 to-orange-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-amber-500/30 relative overflow-hidden"
                            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementsList.map(achievement => {
                    const isUnlocked = unlockedAchievementIds.has(achievement.id);
                    const IconComponent = isUnlocked ? getIconComponent(achievement.icon) : LockClosedIcon;
                    
                    return (
                        <div
                            key={achievement.id}
                            className={`group relative rounded-3xl p-5 flex items-center gap-4 border backdrop-blur-sm transition-all duration-300 overflow-hidden ${
                                isUnlocked 
                                    ? 'bg-gradient-to-br from-slate-900/60 to-slate-800/40 border-amber-500/30 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/20 hover:scale-105' 
                                    : 'bg-slate-900/30 border-slate-800/50 opacity-60'
                            }`}
                        >
                            {isUnlocked && (
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                            <div className={`relative w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                                isUnlocked 
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/30' 
                                    : 'bg-slate-800 border border-slate-700/50'
                            }`}>
                                {isUnlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                                )}
                                <IconComponent className={`w-8 h-8 relative z-10 ${isUnlocked ? 'text-white' : 'text-slate-600'}`} />
                            </div>
                            <div className="flex-grow relative z-10">
                                <h3 className={`font-bold text-base mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                    {achievement.name}
                                </h3>
                                <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {achievement.description}
                                </p>
                            </div>
                            {isUnlocked && (
                                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsView;
