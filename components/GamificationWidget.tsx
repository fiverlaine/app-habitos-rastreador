
import React, { useMemo } from 'react';
import type { Completion, Habit } from '../types';
import { calculateStreak } from '../utils/streak';

interface GamificationWidgetProps {
    completions: Completion[];
    habits: Habit[];
}

const GamificationWidget: React.FC<GamificationWidgetProps> = ({ completions, habits }) => {
    const { points, level, progress, nextLevelPoints } = useMemo(() => {
        const points = completions.length * 10;
        const level = Math.floor(Math.pow(points / 100, 0.7)) + 1;
        const currentLevelPoints = 100 * Math.pow(level - 1, 1 / 0.7);
        const nextLevelPoints = 100 * Math.pow(level, 1 / 0.7);
        const progress = (points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints) * 100;
        return { points, level, progress, nextLevelPoints };
    }, [completions]);
    
    const longestStreak = useMemo(() => {
        if (!habits.length) return 0;
        const allStreaks = habits.map(habit => {
            const habitCompletions = completions.filter(c => c.habitId === habit.id).map(c => c.date);
            return calculateStreak(habitCompletions).currentStreak;
        });
        return Math.max(...allStreaks);
    }, [habits, completions]);

    return (
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Seu Progresso</h2>
                    <p className="text-slate-400 mt-1">Continue assim para subir de nível!</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-400">{completions.length}</p>
                        <p className="text-xs text-slate-400">Concluídos</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-amber-400">{longestStreak} dias</p>
                        <p className="text-xs text-slate-400">Maior Sequência</p>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-indigo-300">Nível {level}</span>
                    <span className="text-xs text-slate-400">{points.toFixed(0)} / {nextLevelPoints.toFixed(0)} XP</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                        className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default GamificationWidget;
