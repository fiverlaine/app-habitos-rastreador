
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
            <div className="text-center py-16 px-6 bg-slate-800 rounded-lg border-2 border-dashed border-slate-700">
                <h3 className="text-xl font-semibold text-white">Nenhum hábito ainda!</h3>
                <p className="text-slate-400 mt-2">Clique no botão '+' para adicionar seu primeiro hábito e começar sua jornada.</p>
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
            <div key={timeOfDay} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{timeOption.icon}</span>
                    <h3 className="text-lg font-bold text-white">{timeOption.label}</h3>
                    <span className="text-sm text-slate-400">({timeOption.description})</span>
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
            <h2 className="text-xl font-bold text-white mb-4">Hábitos de Hoje</h2>
            {orderedTimeOfDay.map(timeOfDay => renderHabitGroup(timeOfDay, groupedHabits[timeOfDay]))}
        </div>
    );
};

export default HabitList;
