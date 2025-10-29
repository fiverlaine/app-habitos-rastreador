import React, { useMemo, useState } from 'react';
import type { Habit, Completion } from '../types';
import { calculateStreak } from '../utils/streak';

interface StatisticsProps {
    habits: Habit[];
    completions: Completion[];
}

const Statistics: React.FC<StatisticsProps> = ({ habits, completions }) => {
    
    const stats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];

        // Total de possíveis conclusões = soma de dias existentes para cada hábito
        const totalPossibleCompletions = habits.reduce((acc, habit) => {
            const startDate = new Date(habit.createdAt);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return acc + Math.max(diffDays, 1);
        }, 0);

        // Taxa geral
        const overallCompletionRate = totalPossibleCompletions > 0
            ? (completions.length / totalPossibleCompletions) * 100
            : 0;

        // Maior sequência histórica
        const longestStreakEver = habits.reduce((maxStreak, habit) => {
            const habitCompletions = completions.filter(c => c.habitId === habit.id).map(c => c.date);
            const { longestStreak } = calculateStreak(habitCompletions);
            return Math.max(maxStreak, longestStreak);
        }, 0);

        // Dias perfeitos
        const perfectDays = countPerfectDays(habits, completions);

        // Hábitos concluídos hoje
        const completedToday = habits.reduce((count, habit) => {
            const todayComps = completions.filter(c => c.habitId === habit.id && c.date === todayStr);
            if (habit.type === 'boolean') {
                return count + (todayComps.length > 0 ? 1 : 0);
            }
            if (habit.type === 'numeric' && habit.targetValue) {
                const value = todayComps.reduce((s, c) => s + (c.value || 0), 0);
                return count + (value >= habit.targetValue ? 1 : 0);
            }
            return count;
        }, 0);

        // Média diária (completions por dia desde o primeiro hábito)
        const firstDate = habits.reduce((min, h) => Math.min(min, new Date(h.createdAt).getTime()), Date.now());
        const daysSince = Math.max(1, Math.ceil((Date.now() - firstDate) / (1000 * 60 * 60 * 24)));
        const dailyAverage = completions.length / daysSince;

        return {
            totalHabits: habits.length,
            overallCompletionRate,
            longestStreakEver,
            perfectDays,
            completedToday,
            dailyAverage
        };
    }, [habits, completions]);

    const weeklyChartData = useMemo(() => {
        const data: { name: string; concluídos: number }[] = [];
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dayName = days[date.getDay()];
            const dateStr = date.toISOString().split('T')[0];
            const count = completions.filter(c => c.date === dateStr).length;
            data.push({ name: dayName, concluídos: count });
        }
        return data;
    }, [completions]);

    return (
        <div className="space-y-6">
            <CompactMonthCalendar habits={habits} completions={completions} />

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-48 sm:h-56 flex items-center justify-center">
                        <Donut value={stats.overallCompletionRate} />
                    </div>
                    <div className="text-center md:text-left">
                        <div className="text-3xl sm:text-4xl font-extrabold text-white">{stats.overallCompletionRate.toFixed(2)}%</div>
                        <div className="text-slate-400 text-sm sm:text-base">Taxa Geral</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <MiniStat title="Melhores Sequências" value={`${stats.longestStreakEver}`} suffix="Dia" color="text-amber-400"/>
                    <MiniStat title="Dias Perfeitos" value={`${stats.perfectDays}`} suffix="Dia" color="text-sky-400"/>
                    <MiniStat title="Hábitos Concluídos" value={`${stats.completedToday}`} color="text-teal-400"/>
                    <MiniStat title="Média Diária" value={`${stats.dailyAverage.toFixed(0)}`} color="text-fuchsia-400"/>
                </div>
            </div>
        </div>
    );
};

const MiniStat: React.FC<{title: string, value: string | number, suffix?: string, color?: string}> = ({ title, value, suffix, color = 'text-teal-400' }) => (
    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 text-center">
        <div className={`text-2xl font-extrabold ${color}`}>{value}<span className="text-slate-400 text-base ml-1">{suffix}</span></div>
        <div className="text-slate-400 text-sm mt-1">{title}</div>
    </div>
);

// Calendário mensal compacto
const CompactMonthCalendar: React.FC<{habits: Habit[]; completions: Completion[]}> = ({ habits, completions }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const days = useMemo(() => getMonthDays(currentDate), [currentDate]);
    const todayStr = new Date().toISOString().split('T')[0];

    const dayCompletionMap = useMemo(() => buildCompletionMap(habits, completions), [habits, completions]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + offset);
            return d;
        });
    };

    const weekHeaders = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

    return (
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between px-2 mb-3">
                <button onClick={() => changeMonth(-1)} className="text-slate-300 hover:text-white">‹</button>
                <div className="text-white font-semibold">{currentDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}</div>
                <button onClick={() => changeMonth(1)} className="text-slate-300 hover:text-white">›</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-slate-400 text-xs mb-2">
                {weekHeaders.map(h => <div key={h}>{h}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />;
                    const dateStr = d.toISOString().split('T')[0];
                    const percent = dayCompletionMap.get(dateStr) || 0;
                    const isToday = dateStr === todayStr;
                    return (
                        <div key={dateStr} className={`relative flex items-center justify-center min-h-[3rem]`}>
                            <span className={`text-sm font-medium z-10 ${isToday ? 'text-teal-400' : 'text-slate-300'}`}>
                                {d.getDate()}
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ProgressCircle progress={percent} isToday={isToday} size="small" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

function getMonthDays(date: Date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const days: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    const cursor = new Date(first);
    while (cursor.getMonth() === date.getMonth()) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return days;
}

function buildCompletionMap(habits: Habit[], completions: Completion[]) {
    const map = new Map<string, number>();
    const byDate: Record<string, Completion[]> = {};
    completions.forEach(c => {
        if (!byDate[c.date]) byDate[c.date] = [];
        byDate[c.date].push(c);
    });
    Object.keys(byDate).forEach(date => {
        const percent = computeCompletionPercentForDate(date, habits, byDate[date]);
        map.set(date, percent);
    });
    return map;
}

function computeCompletionPercentForDate(dateStr: string, habits: Habit[], comps: Completion[]) {
    const activeHabits = habits.filter(h => new Date(h.createdAt).toISOString().split('T')[0] <= dateStr);
    if (activeHabits.length === 0) return 0;
    let completed = 0;
    activeHabits.forEach(h => {
        const list = comps.filter(c => c.habitId === h.id);
        if (h.type === 'boolean') {
            if (list.length > 0) completed++;
        } else if (h.type === 'numeric' && h.targetValue) {
            const value = list.reduce((s, c) => s + (c.value || 0), 0);
            if (value >= h.targetValue) completed++;
        }
    });
    return (completed / activeHabits.length) * 100;
}

function countPerfectDays(habits: Habit[], completions: Completion[]) {
    const dates = Array.from(new Set(completions.map(c => c.date)));
    return dates.reduce((acc, d) => acc + (computeCompletionPercentForDate(d, habits, completions.filter(c => c.date === d)) === 100 ? 1 : 0), 0);
}

// Donut SVG puro para não depender de bibliotecas
const Donut: React.FC<{ value: number }> = ({ value }) => {
    const radius = 80;
    const stroke = 14;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.max(0, Math.min(100, value));
    const offset = circumference - (pct / 100) * circumference;

    return (
        <svg width={200} height={200} viewBox="0 0 200 200">
            <g transform="rotate(-90 100 100)">
                <circle cx="100" cy="100" r={radius} stroke="#334155" strokeWidth={stroke} fill="none" />
                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#14b8a6"
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </g>
        </svg>
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

export default Statistics;