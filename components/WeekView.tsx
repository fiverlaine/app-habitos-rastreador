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
            <div key={`${day.toISOString()}-${index}`} className="flex flex-col items-center flex-1">
                <div className={`text-xs mb-2 ${dim ? 'text-slate-500' : 'text-slate-400'}`}>{getDayLabel(day)}</div>
                <div
                    className={`w-full rounded-t-lg ${dim ? 'opacity-60' : 'transition-all'} ${
                        today ? 'bg-teal-400' : rate === 100 ? 'bg-green-500' : 'bg-slate-700'
                    }`}
                    style={{ height: `${Math.max(rate * 0.6, 20)}px` }}
                ></div>
                <div className={`text-lg font-bold mt-1 ${today ? 'text-white' : dim ? 'text-slate-500' : 'text-slate-400'}`}>
                    {day.getDate()}
                </div>
            </div>
        );
    };

    return (
        <div className="mb-6 relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

            <div className="relative overflow-hidden mb-6 h-28">
                {/* faixa atual */}
                <div className="absolute inset-0 flex justify-between items-end gap-2"
                     style={{ transform: `translateX(${dragX}px)`, transition: isDragging ? 'none' : 'transform 200ms ease-out' }}>
                    {weekDays.map((day, index) => renderCol(day, index))}
                </div>
                {/* faixa vizinha que aparece conforme o arraste */}
                <div className="absolute inset-0 flex justify-between items-end gap-2"
                     style={{ transform: `translateX(calc(${dragX}px + ${dragX < 0 ? '100%' : '-100%'}))`, transition: isDragging ? 'none' : 'transform 200ms ease-out' }}>
                    {neighborDays.map((day, index) => renderCol(day, index, true))}
                </div>
            </div>

            {isDragging && (
                <div className="pointer-events-none absolute inset-y-10 left-0 right-0 flex justify-between px-2 opacity-30">
                    <div className="w-8 h-8 rounded-full bg-slate-700" />
                    <div className="w-8 h-8 rounded-full bg-slate-700" />
                </div>
            )}
        </div>
    );
};

export default WeekView;

