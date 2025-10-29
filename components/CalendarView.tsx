
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
                    
                    // Calcular taxa de conclusão para o dia
                    const getDayCompletionRate = () => {
                        const habitsOnThatDay = habits.filter(h => {
                            const habitCreatedDate = new Date(h.createdAt).toISOString().split('T')[0];
                            return habitCreatedDate <= dateStr;
                        });
                        
                        if (habitsOnThatDay.length === 0) return 0;
                        
                        let completed = 0;
                        habitsOnThatDay.forEach(habit => {
                            const dayCompletions = completions.filter(c => c.habitId === habit.id && c.date === dateStr);
                            
                            if (habit.type === 'boolean' && dayCompletions.length > 0) {
                                completed++;
                            } else if (habit.type === 'numeric' && habit.targetValue) {
                                const currentValue = dayCompletions.reduce((sum, c) => sum + (c.value || 0), 0);
                                if (currentValue >= habit.targetValue) {
                                    completed++;
                                }
                            }
                        });
                        
                        return Math.round((completed / habitsOnThatDay.length) * 100);
                    };
                    
                    const completionRate = getDayCompletionRate();

                    return (
                        <div key={dateStr} className={`relative flex items-center justify-center min-h-[3rem]`}>
                            <span className={`text-sm font-medium z-10 ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                                {day.getDate()}
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ProgressCircle progress={completionRate} isToday={isToday} size="small" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface ProgressCircleProps {
    progress: number;
    isToday: boolean;
    size?: 'small' | 'medium';
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ progress, isToday, size = 'small' }) => {
    const dimensions = size === 'small' ? { radius: 16, stroke: 3.5, size: 36 } : { radius: 30, stroke: 4, size: 64 };
    const circumference = 2 * Math.PI * dimensions.radius;
    const offset = circumference - (progress / 100) * circumference;
    
    return (
        <div className="relative" style={{ width: `${dimensions.size}px`, height: `${dimensions.size}px` }}>
            <svg width={dimensions.size} height={dimensions.size} className="transform -rotate-90">
                <circle
                    cx={dimensions.size / 2}
                    cy={dimensions.size / 2}
                    r={dimensions.radius}
                    fill="none"
                    stroke="#334155"
                    strokeWidth={dimensions.stroke}
                />
                {progress > 0 && (
                    <circle
                        cx={dimensions.size / 2}
                        cy={dimensions.size / 2}
                        r={dimensions.radius}
                        fill="none"
                        stroke={progress === 100 ? '#22c55e' : '#14b8a6'}
                        strokeWidth={dimensions.stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                    />
                )}
            </svg>
        </div>
    );
};

export default CalendarView;
