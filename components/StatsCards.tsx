import React, { useMemo } from 'react';
import type { Habit, Completion } from '../types';
import { calculateStreak } from '../utils/streak';

interface StatsCardsProps {
    habits: Habit[];
    completions: Completion[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ habits, completions }) => {
    const stats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        let todayCompleted = 0;
        
        habits.forEach(habit => {
            const todayCompletions = completions.filter(c => c.habitId === habit.id && c.date === todayStr);
            
            if (habit.type === 'boolean' && todayCompletions.length > 0) {
                todayCompleted++;
            } else if (habit.type === 'numeric' && habit.targetValue) {
                const currentValue = todayCompletions.reduce((sum, c) => sum + (c.value || 0), 0);
                if (currentValue >= habit.targetValue) {
                    todayCompleted++;
                }
            }
        });

        const completionRate = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;

        // Encontrar melhor dia (dia com mais hábitos completados)
        const completionsByDate: Record<string, number> = {};
        
        completions.forEach(c => {
            const habit = habits.find(h => h.id === c.habitId);
            if (!habit) return;
            
            if (!completionsByDate[c.date]) {
                completionsByDate[c.date] = 0;
            }
            
            if (habit.type === 'boolean') {
                completionsByDate[c.date] = (completionsByDate[c.date] || 0) + 1;
            }
        });

        // Agrupar por dia numéricos
        const numericByDate: Record<string, Record<string, number>> = {};
        completions.forEach(c => {
            const habit = habits.find(h => h.id === c.habitId);
            if (!habit || habit.type !== 'numeric') return;
            
            if (!numericByDate[c.date]) {
                numericByDate[c.date] = {};
            }
            if (!numericByDate[c.date][c.habitId]) {
                numericByDate[c.date][c.habitId] = 0;
            }
            numericByDate[c.date][c.habitId] += c.value || 0;
        });

        // Contar hábitos completados por dia para numéricos
        Object.entries(numericByDate).forEach(([date, habitValues]) => {
            Object.entries(habitValues).forEach(([habitId, value]) => {
                const habit = habits.find(h => h.id === habitId);
                if (habit && habit.targetValue && value >= habit.targetValue) {
                    completionsByDate[date] = (completionsByDate[date] || 0) + 1;
                }
            });
        });

        const bestDay = Math.max(...Object.values(completionsByDate), 0);

        // Maior sequência atual entre todos os hábitos
        const longestCurrentStreak = habits.reduce((maxStreak, habit) => {
            const habitCompletions = completions.filter(c => c.habitId === habit.id).map(c => c.date);
            const { currentStreak } = calculateStreak(habitCompletions);
            return Math.max(maxStreak, currentStreak);
        }, 0);

        return {
            completionRate,
            bestDay,
            totalHabits: habits.length,
            longestStreak: longestCurrentStreak,
        };
    }, [habits, completions]);

    return (
        <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                <div className="text-2xl font-bold text-red-400">{stats.completionRate}%</div>
                <div className="text-xs text-slate-400 mt-1">Concluído</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                <div className="text-2xl font-bold text-blue-400">{stats.bestDay}</div>
                <div className="text-xs text-slate-400 mt-1">Melhor Dia</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                <div className="text-2xl font-bold text-teal-400">{stats.totalHabits}</div>
                <div className="text-xs text-slate-400 mt-1">Total</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                <div className="text-2xl font-bold text-yellow-400">{stats.longestStreak}</div>
                <div className="text-xs text-slate-400 mt-1">Sequência</div>
            </div>
        </div>
    );
};

export default StatsCards;

