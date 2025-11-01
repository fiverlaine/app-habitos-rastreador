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
        <div className="grid grid-cols-4 gap-2.5 mb-6 animate-slide-up">
            <div className="group relative bg-gradient-to-br from-rose-500/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                    <div className="text-2xl font-extrabold bg-gradient-to-br from-rose-400 to-pink-500 bg-clip-text text-transparent">{stats.completionRate}%</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-1.5 tracking-wide">Concluído</div>
                </div>
            </div>
            <div className="group relative bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                    <div className="text-2xl font-extrabold bg-gradient-to-br from-blue-400 to-cyan-500 bg-clip-text text-transparent">{stats.bestDay}</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-1.5 tracking-wide">Melhor Dia</div>
                </div>
            </div>
            <div className="group relative bg-gradient-to-br from-emerald-500/10 to-teal-600/10 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                    <div className="text-2xl font-extrabold bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-transparent">{stats.totalHabits}</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-1.5 tracking-wide">Total</div>
                </div>
            </div>
            <div className="group relative bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                    <div className="text-2xl font-extrabold bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-transparent">{stats.longestStreak}</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-1.5 tracking-wide">Sequência</div>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;

