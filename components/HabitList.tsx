
import React, { useMemo } from 'react';
import type { Habit, Completion, TimeOfDay } from '../types';
import { TIME_OF_DAY_OPTIONS } from '../constants';
import HabitItem from './HabitItem';

interface HabitListProps {
    habits: Habit[];
    completions: Completion[];
    onToggle: (habitId: string, value?: number) => void;
    onDelete: (habitId: string) => void;
    onUpdate: (habitId: string, updates: Partial<Habit>) => void;
}

const HabitList: React.FC<HabitListProps> = ({ habits, completions, onToggle, onDelete, onUpdate }) => {
    
    if (habits.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-gradient-to-br from-slate-900/40 to-slate-900/20 backdrop-blur-sm rounded-3xl border border-dashed border-slate-700/50 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center border border-cyan-500/20">
                    <svg className="w-10 h-10 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhum hábito ainda</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Clique no botão <span className="text-cyan-400 font-semibold">+</span> para adicionar seu primeiro hábito e começar sua jornada.
                </p>
            </div>
        );
    }
    
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Agrupar hábitos por período do dia
    const groupedHabits = useMemo(() => {
        const groups: Record<TimeOfDay, Habit[]> = {
            morning: [],
            afternoon: [],
            evening: [],
            anytime: []
        };

        habits.forEach(habit => {
            const timeOfDay = habit.timeOfDay || 'anytime';
            groups[timeOfDay].push(habit);
        });

        return groups;
    }, [habits]);

    const renderHabitGroup = (timeOfDay: TimeOfDay, habitsInGroup: Habit[]) => {
        if (habitsInGroup.length === 0) return null;

        const timeOption = TIME_OF_DAY_OPTIONS.find(opt => opt.value === timeOfDay);
        if (!timeOption) return null;

        return (
            <div key={timeOfDay} className="mb-7 animate-slide-up">
                <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 flex items-center justify-center text-xl backdrop-blur-sm">
                        {timeOption.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-white">{timeOption.label}</h3>
                        <p className="text-xs text-slate-500">{timeOption.description}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {habitsInGroup.map(habit => {
                        const todayCompletions = completions.filter(c => c.habitId === habit.id && c.date === todayStr);
                        const currentValue = todayCompletions.reduce((sum, c) => sum + (c.value || 0), 0);
                        const isCompleted = habit.type === 'boolean' 
                            ? todayCompletions.length > 0
                            : habit.targetValue ? currentValue >= habit.targetValue : false;

                        return (
                            <HabitItem
                                key={habit.id}
                                habit={habit}
                                isCompleted={isCompleted}
                                currentValue={currentValue}
                                completions={completions.filter(c => c.habitId === habit.id)}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                            />
                        );
                    })}
                </div>
            </div>
        );
    };

    // Renderizar grupos na ordem: Manhã, Tarde, Noite, Qualquer hora
    const orderedTimeOfDay: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'anytime'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1 mb-5">
                <h2 className="text-2xl font-bold text-white">Hoje</h2>
                <div className="text-sm text-slate-500 font-medium">
                    {habits.length} {habits.length === 1 ? 'hábito' : 'hábitos'}
                </div>
            </div>
            {orderedTimeOfDay.map(timeOfDay => renderHabitGroup(timeOfDay, groupedHabits[timeOfDay]))}
        </div>
    );
};

export default HabitList;
