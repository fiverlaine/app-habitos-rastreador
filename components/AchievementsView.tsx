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
        <div className="space-y-8">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
                <TrophyIcon className="w-12 h-12 mx-auto text-amber-400" />
                <h2 className="text-2xl font-bold mt-2">Conquistas</h2>
                <p className="text-slate-400 mt-1">Você desbloqueou {unlockedCount} de {totalCount} conquistas.</p>
                <div className="w-full bg-slate-700 rounded-full h-3 mt-4 max-w-sm mx-auto">
                    <div
                        className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementsList.map(achievement => {
                    const isUnlocked = unlockedAchievementIds.has(achievement.id);
                    const IconComponent = isUnlocked ? getIconComponent(achievement.icon) : LockClosedIcon;
                    
                    return (
                        <div
                            key={achievement.id}
                            className={`rounded-lg p-5 flex items-center gap-4 border transition-all duration-300 ${
                                isUnlocked 
                                ? 'bg-slate-800 border-slate-700' 
                                : 'bg-slate-800/50 border-slate-700/50'
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center ${
                                isUnlocked ? 'bg-indigo-600' : 'bg-slate-700'
                            }`}>
                                <IconComponent className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-grow">
                                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                                    {achievement.name}
                                </h3>
                                <p className={`text-sm ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {achievement.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsView;
