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
        <div className="space-y-6 animate-fade-in">
            <div className="mb-6 px-1">
                <h1 className="text-2xl font-bold text-white mb-1">Visão Geral</h1>
                <p className="text-sm text-slate-500">Estatísticas completas do seu progresso</p>
            </div>

            <CompactMonthCalendar habits={habits} completions={completions} />

            <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-800/50 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="h-56 flex items-center justify-center">
                        <Donut value={stats.overallCompletionRate} />
                    </div>
                    <div className="text-center md:text-left space-y-3">
                        <div className="text-5xl font-extrabold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            {stats.overallCompletionRate.toFixed(1)}%
                        </div>
                        <div className="text-slate-400 text-base font-semibold">Taxa Geral de Conclusão</div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Seu desempenho geral em todos os hábitos desde o início
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                    <MiniStat title="Melhores Sequências" value={`${stats.longestStreakEver}`} suffix="Dia" color="amber"/>
                    <MiniStat title="Dias Perfeitos" value={`${stats.perfectDays}`} suffix="Dia" color="sky"/>
                    <MiniStat title="Hábitos Concluídos" value={`${stats.completedToday}`} color="emerald"/>
                    <MiniStat title="Média Diária" value={`${stats.dailyAverage.toFixed(0)}`} color="fuchsia"/>
                </div>
            </div>
        </div>
    );
};

const MiniStat: React.FC<{title: string, value: string | number, suffix?: string, color?: 'amber' | 'sky' | 'emerald' | 'fuchsia'}> = ({ title, value, suffix, color = 'emerald' }) => {
    const colorClasses = {
        amber: 'from-amber-500/10 to-orange-600/10 border-amber-500/20 text-amber-400',
        sky: 'from-blue-500/10 to-cyan-600/10 border-blue-500/20 text-blue-400',
        emerald: 'from-emerald-500/10 to-teal-600/10 border-emerald-500/20 text-emerald-400',
        fuchsia: 'from-fuchsia-500/10 to-pink-600/10 border-fuchsia-500/20 text-fuchsia-400',
    };

    return (
        <div className={`group relative bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm rounded-2xl p-4 border text-center transition-all duration-300 hover:scale-105 overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
                <div className={`text-2xl font-extrabold ${colorClasses[color].split(' ').pop()}`}>
                    {value}
                    {suffix && <span className="text-slate-400 text-base ml-1">{suffix}</span>}
                </div>
                <div className="text-slate-500 text-xs font-semibold mt-2">{title}</div>
            </div>
        </div>
    );
};

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
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-5 border border-slate-800/50 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between px-2 mb-4">
                <button 
                    onClick={() => changeMonth(-1)} 
                    className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="text-white font-bold text-lg">
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
                <button 
                    onClick={() => changeMonth(1)} 
                    className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-3">
                {weekHeaders.map(h => <div key={h}>{h}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />;
                    const dateStr = d.toISOString().split('T')[0];
                    const percent = dayCompletionMap.get(dateStr) || 0;
                    const isToday = dateStr === todayStr;
                    return (
                        <div key={dateStr} className={`relative flex items-center justify-center min-h-[3.5rem] rounded-xl transition-all duration-300 ${isToday ? 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10' : ''}`}>
                            <span className={`text-sm font-bold z-10 ${isToday ? 'text-white' : 'text-slate-300'}`}>
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
    const stroke = 16;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.max(0, Math.min(100, value));
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="relative">
            <svg width={220} height={220} viewBox="0 0 200 200" className="drop-shadow-2xl">
                <defs>
                    <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
                <g transform="rotate(-90 100 100)">
                    <circle cx="100" cy="100" r={radius} stroke="#1e293b" strokeWidth={stroke} fill="none" />
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="url(#donutGradient)"
                        strokeWidth={stroke}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </g>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl font-extrabold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {value.toFixed(0)}%
                    </div>
                </div>
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
    const dimensions = size === 'small' ? { radius: 18, stroke: 3.5, size: 42 } : { radius: 30, stroke: 4, size: 64 };
    const circumference = 2 * Math.PI * dimensions.radius;
    const offset = circumference - (progress / 100) * circumference;
    
    return (
        <div className="relative" style={{ width: `${dimensions.size}px`, height: `${dimensions.size}px` }}>
            <svg width={dimensions.size} height={dimensions.size} className="transform -rotate-90">
                <defs>
                    <linearGradient id={`progressGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={progress === 100 ? "#22c55e" : "#06b6d4"} />
                        <stop offset="100%" stopColor={progress === 100 ? "#10b981" : "#3b82f6"} />
                    </linearGradient>
                </defs>
                <circle
                    cx={dimensions.size / 2}
                    cy={dimensions.size / 2}
                    r={dimensions.radius}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth={dimensions.stroke}
                />
                {progress > 0 && (
                    <circle
                        cx={dimensions.size / 2}
                        cy={dimensions.size / 2}
                        r={dimensions.radius}
                        fill="none"
                        stroke={`url(#progressGradient-${size})`}
                        strokeWidth={dimensions.stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                )}
            </svg>
        </div>
    );
};

export default Statistics;