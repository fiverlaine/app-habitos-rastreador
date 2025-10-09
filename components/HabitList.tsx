
import React, { useMemo } from 'react';
import type { Habit, Completion } from '../types';
import HabitItem from './HabitItem';

interface HabitListProps {
    habits: Habit[];
    completions: Completion[];
    onToggle: (habitId: string, value?: number) => void;
    onDelete: (habitId: string) => void;
}

const HabitList: React.FC<HabitListProps> = ({ habits, completions, onToggle, onDelete }) => {
    
    if (habits.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-slate-800 rounded-lg border-2 border-dashed border-slate-700">
                <h3 className="text-xl font-semibold text-white">Nenhum hábito ainda!</h3>
                <p className="text-slate-400 mt-2">Clique no botão '+' para adicionar seu primeiro hábito e começar sua jornada.</p>
            </div>
        );
    }
    
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Hábitos de Hoje</h2>
            {habits.map(habit => {
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
                    />
                );
            })}
        </div>
    );
};

export default HabitList;
