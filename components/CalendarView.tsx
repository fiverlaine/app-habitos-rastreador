
import React, { useState, useMemo } from 'react';
import type { Habit, Completion } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

interface CalendarViewProps {
    habits: Habit[];
    completions: Completion[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ habits, completions }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = useMemo(() => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const days = [];
        while (date.getMonth() === currentDate.getMonth()) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentDate]);

    const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(), [currentDate]);

    const completionsByDate = useMemo(() => {
        const map = new Map<string, string[]>();
        completions.forEach(c => {
            const habit = habits.find(h => h.id === c.habitId);
            if (habit) {
                if (!map.has(c.date)) {
                    map.set(c.date, []);
                }
                map.get(c.date)?.push(habit.color);
            }
        });
        return map;
    }, [completions, habits]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white capitalize">
                    {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map(day => <div key={day} className="font-semibold text-slate-400 text-sm mb-2">{day}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {daysInMonth.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayCompletions = completionsByDate.get(dateStr) || [];
                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                    return (
                        <div key={dateStr} className="flex flex-col items-center justify-start h-24 p-1 bg-slate-800 border border-slate-700/50 rounded-md">
                            <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${isToday ? 'bg-indigo-600 text-white' : ''}`}>
                                {day.getDate()}
                            </span>
                            <div className="flex flex-wrap justify-center gap-1 mt-1">
                                {dayCompletions.slice(0, 4).map((color, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${color}`}></div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
