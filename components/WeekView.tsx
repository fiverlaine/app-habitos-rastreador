import React, { useMemo, useState, useRef } from 'react';
import type { Habit, Completion } from '../types';

interface WeekViewProps {
    habits: Habit[];
    completions: Completion[];
}

const WeekView: React.FC<WeekViewProps> = ({ habits, completions }) => {
    const [anchorDate, setAnchorDate] = useState(new Date()); // último dia da semana visível
    const touchStartX = useRef<number | null>(null);
    const touchDeltaX = useRef(0);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const weekDays = useMemo(() => {
        const days = [] as Date[];
        const end = new Date(anchorDate);
        // Normaliza para final do dia
        for (let i = 6; i >= 0; i--) {
            const d = new Date(end);
            d.setDate(end.getDate() - i);
            days.push(d);
        }
        return days;
    }, [anchorDate]);

    // Semana vizinha usada para animar o preview durante o arraste
    const neighborDays = useMemo(() => {
        const sign = dragX < 0 ? 1 : -1; // arrastando para esquerda -> próxima semana
        const days = [] as Date[];
        const end = new Date(anchorDate);
        end.setDate(end.getDate() + sign * 7);
        for (let i = 6; i >= 0; i--) {
            const d = new Date(end);
            d.setDate(end.getDate() - i);
            days.push(d);
        }
        return days;
    }, [anchorDate, dragX]);

    const getDayLabel = (date: Date) => {
        const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        return dayNames[date.getDay()];
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
    };

    const getTodayCompletionRate = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        let completed = 0;
        
        habits.forEach(habit => {
            const todayCompletions = completions.filter(c => c.habitId === habit.id && c.date === todayStr);
            
            if (habit.type === 'boolean' && todayCompletions.length > 0) {
                completed++;
            } else if (habit.type === 'numeric' && habit.targetValue) {
                const currentValue = todayCompletions.reduce((sum, c) => sum + (c.value || 0), 0);
                if (currentValue >= habit.targetValue) {
                    completed++;
                }
            }
        });
        
        return habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    };

    const getDayCompletionRate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        let completed = 0;
        
        // Filtrar apenas hábitos que existiam naquele dia
        const habitsOnThatDay = habits.filter(h => {
            const habitCreatedDate = new Date(h.createdAt).toISOString().split('T')[0];
            return habitCreatedDate <= dateStr;
        });
        
        if (habitsOnThatDay.length === 0) return 0;
        
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

    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX;
        touchDeltaX.current = 0;
        setIsDragging(true);
    };

    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current == null) return;
        touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
        setDragX(touchDeltaX.current);
    };

    const onTouchEnd = () => {
        const threshold = 40; // px
        let didSwipe = false;
        if (Math.abs(touchDeltaX.current) > threshold) {
            // swipe left -> próxima semana; swipe right -> semana anterior
            const dir = touchDeltaX.current < 0 ? 1 : -1;
            setAnchorDate(prev => {
                const d = new Date(prev);
                d.setDate(d.getDate() + dir * 7);
                return d;
            });
            didSwipe = true;
        }
        // anima o retorno
        setIsDragging(false);
        setDragX(didSwipe ? (touchDeltaX.current < 0 ? -80 : 80) : dragX);
        requestAnimationFrame(() => {
            setDragX(0);
        });
        touchStartX.current = null;
        touchDeltaX.current = 0;
    };

    const renderCol = (day: Date, index: number, dim?: boolean) => {
        const rate = getDayCompletionRate(day);
        const today = isToday(day);
        return (
            <div key={`${day.toISOString()}-${index}`} className="flex flex-col items-center flex-1 gap-2">
                <div className={`text-[10px] font-semibold tracking-wider uppercase ${dim ? 'text-slate-600' : 'text-slate-500'}`}>
                    {getDayLabel(day)}
                </div>
                <div className="relative w-full flex items-end justify-center" style={{ height: '72px' }}>
                    <div
                        className={`w-full max-w-[36px] rounded-xl relative overflow-hidden transition-all duration-500 ${dim ? 'opacity-40' : ''}`}
                        style={{ height: `${Math.max(rate * 0.68, 16)}px` }}
                    >
                        {/* Gradiente base */}
                        <div className={`absolute inset-0 ${
                            today 
                                ? 'bg-gradient-to-t from-cyan-500 to-blue-600' 
                                : rate === 100 
                                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' 
                                    : rate > 0
                                        ? 'bg-gradient-to-t from-slate-600 to-slate-500'
                                        : 'bg-slate-800'
                        }`}></div>
                        
                        {/* Efeito shimmer */}
                        {rate > 0 && !dim && (
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
                        )}
                        
                        {/* Brilho no topo */}
                        {rate > 30 && !dim && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-xl"></div>
                        )}
                    </div>
                </div>
                <div className={`text-base font-bold transition-all duration-300 ${
                    today 
                        ? 'text-white scale-110' 
                        : dim 
                            ? 'text-slate-600' 
                            : 'text-slate-400'
                }`}>
                    {day.getDate()}
                </div>
                {today && !dim && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse"></div>
                )}
            </div>
        );
    };

    return (
        <div className="mb-6 relative animate-slide-up" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {/* Card container com glassmorphism */}
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-5 border border-slate-800/50 shadow-xl">
                <div className="relative overflow-hidden h-32">
                    {/* faixa atual */}
                    <div className="absolute inset-0 flex justify-between items-end gap-1.5"
                         style={{ transform: `translateX(${dragX}px)`, transition: isDragging ? 'none' : 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        {weekDays.map((day, index) => renderCol(day, index))}
                    </div>
                    {/* faixa vizinha que aparece conforme o arraste */}
                    <div className="absolute inset-0 flex justify-between items-end gap-1.5"
                         style={{ transform: `translateX(calc(${dragX}px + ${dragX < 0 ? '100%' : '-100%'}))`, transition: isDragging ? 'none' : 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        {neighborDays.map((day, index) => renderCol(day, index, true))}
                    </div>
                </div>

                {/* Indicadores de swipe */}
                {isDragging && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeekView;

