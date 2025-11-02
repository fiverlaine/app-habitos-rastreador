import React, { useMemo, useState } from 'react';
import type { Habit, Completion } from '../types';
import { calculateStreak } from '../utils/streak';
import { getIconComponent } from './icons';

interface StatisticsProps {
    habits: Habit[];
    completions: Completion[];
}

type PeriodFilter = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

const Statistics: React.FC<StatisticsProps> = ({ habits, completions }) => {
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
    
    // Função para calcular data de início baseada no filtro
    const getStartDate = (period: PeriodFilter): Date | null => {
        const today = new Date();
        const start = new Date(today);
        
        switch (period) {
            case '7d':
                start.setDate(today.getDate() - 7);
                return start;
            case '30d':
                start.setDate(today.getDate() - 30);
                return start;
            case '3m':
                start.setMonth(today.getMonth() - 3);
                return start;
            case '6m':
                start.setMonth(today.getMonth() - 6);
                return start;
            case '1y':
                start.setFullYear(today.getFullYear() - 1);
                return start;
            case 'all':
                return null;
        }
    };

    // Filtrar dados baseado no período selecionado
    const filteredData = useMemo(() => {
        const startDate = getStartDate(periodFilter);
        if (!startDate) return { habits, completions };
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const filteredCompletions = completions.filter(c => c.date >= startDateStr);
        
        // Filtrar hábitos que foram criados antes ou durante o período
        const filteredHabits = habits.filter(h => {
            const habitCreatedDate = new Date(h.createdAt).toISOString().split('T')[0];
            return habitCreatedDate <= new Date().toISOString().split('T')[0];
        });
        
        return { habits: filteredHabits, completions: filteredCompletions };
    }, [habits, completions, periodFilter]);

    // Dados do período anterior para comparação
    const previousPeriodData = useMemo(() => {
        const startDate = getStartDate(periodFilter);
        if (!startDate) return null;
        
        const today = new Date();
        let periodEnd: Date;
        let periodStart: Date;
        
        switch (periodFilter) {
            case '7d':
                periodEnd = new Date(startDate);
                periodStart = new Date(startDate);
                periodStart.setDate(periodStart.getDate() - 7);
                break;
            case '30d':
                periodEnd = new Date(startDate);
                periodStart = new Date(startDate);
                periodStart.setDate(periodStart.getDate() - 30);
                break;
            case '3m':
                periodEnd = new Date(startDate);
                periodStart = new Date(startDate);
                periodStart.setMonth(periodStart.getMonth() - 3);
                break;
            case '6m':
                periodEnd = new Date(startDate);
                periodStart = new Date(startDate);
                periodStart.setMonth(periodStart.getMonth() - 6);
                break;
            case '1y':
                periodEnd = new Date(startDate);
                periodStart = new Date(startDate);
                periodStart.setFullYear(periodStart.getFullYear() - 1);
                break;
            default:
                return null;
        }
        
        const startDateStr = periodStart.toISOString().split('T')[0];
        const endDateStr = periodEnd.toISOString().split('T')[0];
        
        const prevCompletions = completions.filter(c => 
            c.date >= startDateStr && c.date < endDateStr
        );
        
        return { habits, completions: prevCompletions };
    }, [habits, completions, periodFilter]);
    
    const stats = useMemo(() => {
        const { habits: filteredHabits, completions: filteredCompletions } = filteredData;
        const todayStr = new Date().toISOString().split('T')[0];

        // Total de possíveis conclusões = soma de dias existentes para cada hábito
        const totalPossibleCompletions = filteredHabits.reduce((acc, habit) => {
            const startDate = new Date(habit.createdAt);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return acc + Math.max(diffDays, 1);
        }, 0);

        // Taxa geral
        const overallCompletionRate = totalPossibleCompletions > 0
            ? (filteredCompletions.length / totalPossibleCompletions) * 100
            : 0;

        // Maior sequência histórica
        const longestStreakEver = filteredHabits.reduce((maxStreak, habit) => {
            const habitCompletions = filteredCompletions.filter(c => c.habitId === habit.id).map(c => c.date);
            const { longestStreak } = calculateStreak(habitCompletions);
            return Math.max(maxStreak, longestStreak);
        }, 0);

        // Dias perfeitos
        const perfectDays = countPerfectDays(filteredHabits, filteredCompletions);

        // Hábitos concluídos hoje
        const completedToday = filteredHabits.reduce((count, habit) => {
            const todayComps = filteredCompletions.filter(c => c.habitId === habit.id && c.date === todayStr);
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
        const startDate = getStartDate(periodFilter);
        const firstDate = filteredHabits.reduce((min, h) => Math.min(min, new Date(h.createdAt).getTime()), Date.now());
        const periodStart = startDate ? startDate.getTime() : firstDate;
        const daysSince = Math.max(1, Math.ceil((Date.now() - periodStart) / (1000 * 60 * 60 * 24)));
        const dailyAverage = filteredCompletions.length / daysSince;

        // Calcular taxa do período anterior para comparação
        let previousRate: number | null = null;
        let rateChange: number | null = null;
        if (previousPeriodData) {
            const startDate = getStartDate(periodFilter);
            if (startDate) {
                const today = new Date();
                let periodEnd: Date;
                let periodStart: Date;
                
                switch (periodFilter) {
                    case '7d':
                        periodEnd = new Date(startDate);
                        periodStart = new Date(startDate);
                        periodStart.setDate(periodStart.getDate() - 7);
                        break;
                    case '30d':
                        periodEnd = new Date(startDate);
                        periodStart = new Date(startDate);
                        periodStart.setDate(periodStart.getDate() - 30);
                        break;
                    case '3m':
                        periodEnd = new Date(startDate);
                        periodStart = new Date(startDate);
                        periodStart.setMonth(periodStart.getMonth() - 3);
                        break;
                    case '6m':
                        periodEnd = new Date(startDate);
                        periodStart = new Date(startDate);
                        periodStart.setMonth(periodStart.getMonth() - 6);
                        break;
                    case '1y':
                        periodEnd = new Date(startDate);
                        periodStart = new Date(startDate);
                        periodStart.setFullYear(periodStart.getFullYear() - 1);
                        break;
                    default:
                        periodEnd = new Date(startDate);
                        periodStart = new Date(startDate);
                }
                
                const prevTotalPossible = previousPeriodData.habits.reduce((acc, habit) => {
                    const habitCreated = new Date(habit.createdAt);
                    const startTime = Math.max(periodStart.getTime(), habitCreated.getTime());
                    const endTime = periodEnd.getTime();
                    const diffDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
                    return acc + Math.max(diffDays, 1);
                }, 0);
                
                previousRate = prevTotalPossible > 0
                    ? (previousPeriodData.completions.length / prevTotalPossible) * 100
                    : 0;
                
                rateChange = overallCompletionRate - previousRate;
            }
        }

        return {
            totalHabits: filteredHabits.length,
            overallCompletionRate,
            longestStreakEver,
            perfectDays,
            completedToday,
            dailyAverage,
            previousRate,
            rateChange
        };
    }, [filteredData, periodFilter]);

    // Dados para gráfico de linha temporal
    const lineChartData = useMemo(() => {
        const { habits: filteredHabits, completions: filteredCompletions } = filteredData;
        const startDate = getStartDate(periodFilter);
        const today = new Date();
        
        let daysCount = 30; // padrão
        let interval = 'day';
        
        switch (periodFilter) {
            case '7d':
                daysCount = 7;
                interval = 'day';
                break;
            case '30d':
                daysCount = 30;
                interval = 'day';
                break;
            case '3m':
                daysCount = 90;
                interval = 'day';
                break;
            case '6m':
                daysCount = 180;
                interval = 'week';
                break;
            case '1y':
                daysCount = 365;
                interval = 'week';
                break;
            case 'all':
                const firstHabitDate = filteredHabits.reduce((min, h) => 
                    Math.min(min, new Date(h.createdAt).getTime()), Date.now()
                );
                daysCount = Math.ceil((Date.now() - firstHabitDate) / (1000 * 60 * 60 * 24));
                interval = daysCount > 180 ? 'week' : 'day';
                break;
        }
        
        const data: { date: string; rate: number }[] = [];
        const endDate = new Date(today);
        const actualStart = startDate || new Date(endDate.getTime() - daysCount * 24 * 60 * 60 * 1000);
        
        if (interval === 'day') {
            for (let i = 0; i < daysCount; i++) {
                const date = new Date(actualStart);
                date.setDate(actualStart.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                
                const activeHabits = filteredHabits.filter(h => 
                    new Date(h.createdAt).toISOString().split('T')[0] <= dateStr
                );
                
                if (activeHabits.length === 0) {
                    data.push({ date: dateStr, rate: 0 });
                    continue;
                }
                
                let completed = 0;
                activeHabits.forEach(habit => {
                    const dayCompletions = filteredCompletions.filter(c => 
                        c.habitId === habit.id && c.date === dateStr
                    );
                    
                    if (habit.type === 'boolean' && dayCompletions.length > 0) {
                        completed++;
                    } else if (habit.type === 'numeric' && habit.targetValue) {
                        const value = dayCompletions.reduce((s, c) => s + (c.value || 0), 0);
                        if (value >= habit.targetValue) completed++;
                    }
                });
                
                const rate = (completed / activeHabits.length) * 100;
                data.push({ date: dateStr, rate });
            }
        } else {
            // Agrupar por semana
            let currentWeekStart = new Date(actualStart);
            while (currentWeekStart <= endDate) {
                const weekEnd = new Date(currentWeekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                let totalRate = 0;
                let dayCount = 0;
                
                for (let d = new Date(currentWeekStart); d <= weekEnd && d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    const activeHabits = filteredHabits.filter(h => 
                        new Date(h.createdAt).toISOString().split('T')[0] <= dateStr
                    );
                    
                    if (activeHabits.length > 0) {
                        let completed = 0;
                        activeHabits.forEach(habit => {
                            const dayCompletions = filteredCompletions.filter(c => 
                                c.habitId === habit.id && c.date === dateStr
                            );
                            
                            if (habit.type === 'boolean' && dayCompletions.length > 0) {
                                completed++;
                            } else if (habit.type === 'numeric' && habit.targetValue) {
                                const value = dayCompletions.reduce((s, c) => s + (c.value || 0), 0);
                                if (value >= habit.targetValue) completed++;
                            }
                        });
                        
                        totalRate += (completed / activeHabits.length) * 100;
                        dayCount++;
                    }
                }
                
                if (dayCount > 0) {
                    data.push({ 
                        date: currentWeekStart.toISOString().split('T')[0], 
                        rate: totalRate / dayCount 
                    });
                }
                
                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            }
        }
        
        return data;
    }, [filteredData, periodFilter]);

    // Ranking de hábitos
    const habitRanking = useMemo(() => {
        const { habits: filteredHabits, completions: filteredCompletions } = filteredData;
        
        const rankings = filteredHabits.map(habit => {
            const habitCompletions = filteredCompletions.filter(c => c.habitId === habit.id);
            const startDate = getStartDate(periodFilter);
            const habitCreated = new Date(habit.createdAt);
            
            let possibleDays = 0;
            if (startDate) {
                const periodStart = Math.max(startDate.getTime(), habitCreated.getTime());
                possibleDays = Math.ceil((Date.now() - periodStart) / (1000 * 60 * 60 * 24));
            } else {
                possibleDays = Math.ceil((Date.now() - habitCreated.getTime()) / (1000 * 60 * 60 * 24));
            }
            
            possibleDays = Math.max(possibleDays, 1);
            
            let completedDays = 0;
            const datesWithCompletion = new Set<string>();
            
            habitCompletions.forEach(c => {
                datesWithCompletion.add(c.date);
            });
            
            datesWithCompletion.forEach(dateStr => {
                const dayCompletions = habitCompletions.filter(c => c.date === dateStr);
                
                if (habit.type === 'boolean' && dayCompletions.length > 0) {
                    completedDays++;
                } else if (habit.type === 'numeric' && habit.targetValue) {
                    const value = dayCompletions.reduce((s, c) => s + (c.value || 0), 0);
                    if (value >= habit.targetValue) completedDays++;
                }
            });
            
            const completionRate = (completedDays / possibleDays) * 100;
            
            return {
                habit,
                completionRate,
                completedDays,
                possibleDays
            };
        }).sort((a, b) => b.completionRate - a.completionRate);
        
        return rankings;
    }, [filteredData, periodFilter]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="mb-6 px-1">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Visão Geral</h1>
                        <p className="text-sm text-slate-500">Estatísticas completas do seu progresso</p>
                    </div>
                </div>
                
                {/* Filtro de Período */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {([
                        { value: '7d' as PeriodFilter, label: '7 dias' },
                        { value: '30d' as PeriodFilter, label: '30 dias' },
                        { value: '3m' as PeriodFilter, label: '3 meses' },
                        { value: '6m' as PeriodFilter, label: '6 meses' },
                        { value: '1y' as PeriodFilter, label: '1 ano' },
                        { value: 'all' as PeriodFilter, label: 'Tudo' },
                    ]).map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setPeriodFilter(value)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                periodFilter === value
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comparação com período anterior */}
            {stats.rateChange !== null && stats.previousRate !== null && (
                <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-5 border border-slate-800/50 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Comparado ao período anterior</p>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-white">
                                    {stats.previousRate.toFixed(1)}%
                                </span>
                                <span className={`text-lg font-semibold flex items-center gap-1 ${
                                    stats.rateChange > 0 ? 'text-emerald-400' : stats.rateChange < 0 ? 'text-red-400' : 'text-slate-400'
                                }`}>
                                    {stats.rateChange > 0 ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    ) : stats.rateChange < 0 ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                        </svg>
                                    ) : null}
                                    {stats.rateChange !== 0 && `${Math.abs(stats.rateChange).toFixed(1)}%`}
                                    {stats.rateChange === 0 && 'Sem mudança'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CompactMonthCalendar habits={filteredData.habits} completions={filteredData.completions} />

            {/* Gráfico de Linha Temporal */}
            {lineChartData.length > 0 && (
                <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-800/50 shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-4">Evolução da Taxa de Conclusão</h2>
                    <LineChart data={lineChartData} />
                </div>
            )}

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
                            Seu desempenho geral em todos os hábitos {periodFilter === 'all' ? 'desde o início' : 'no período selecionado'}
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

            {/* Ranking de Hábitos */}
            {habitRanking.length > 0 && (
                <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-800/50 shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-4">Ranking de Hábitos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Melhores */}
                        <div>
                            <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Melhores Desempenhos
                            </h3>
                            <div className="space-y-2">
                                {habitRanking.slice(0, 5).map((item, index) => (
                                    <HabitRankItem key={item.habit.id} item={item} rank={index + 1} isBest={true} />
                                ))}
                            </div>
                        </div>
                        
                        {/* Piores */}
                        <div>
                            <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Precisam de Atenção
                            </h3>
                            <div className="space-y-2">
                                {habitRanking.slice(-5).reverse().map((item, index) => (
                                    <HabitRankItem key={item.habit.id} item={item} rank={habitRanking.length - index} isBest={false} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

// Componente de Gráfico de Linha
interface LineChartProps {
    data: { date: string; rate: number }[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    if (data.length === 0) return null;

    const width = 800;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxRate = Math.max(...data.map(d => d.rate), 100);
    const minRate = Math.min(...data.map(d => d.rate), 0);

    const xScale = (index: number) => (index / (data.length - 1 || 1)) * chartWidth;
    const yScale = (value: number) => chartHeight - ((value - minRate) / (maxRate - minRate || 1)) * chartHeight;

    // Gerar pontos para a linha
    const points = data.map((d, i) => ({
        x: xScale(i),
        y: yScale(d.rate),
        rate: d.rate
    }));

    // Criar path para a linha
    const pathData = points.map((point, i) => 
        i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    ).join(' ');

    // Criar path para a área preenchida
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

    return (
        <div className="w-full overflow-x-auto">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <g transform={`translate(${padding.left}, ${padding.top})`}>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((value) => {
                        const y = yScale(value);
                        return (
                            <g key={value}>
                                <line
                                    x1={0}
                                    y1={y}
                                    x2={chartWidth}
                                    y2={y}
                                    stroke="#1e293b"
                                    strokeWidth={1}
                                    strokeDasharray="4,4"
                                    opacity={0.3}
                                />
                                <text
                                    x={-10}
                                    y={y + 4}
                                    textAnchor="end"
                                    fill="#64748b"
                                    fontSize="10"
                                >
                                    {value}%
                                </text>
                            </g>
                        );
                    })}

                    {/* Área preenchida */}
                    <path
                        d={areaPath}
                        fill="url(#lineGradient)"
                    />

                    {/* Linha */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Pontos */}
                    {points.map((point, i) => (
                        <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r={4}
                            fill="#06b6d4"
                            className="hover:r-6 transition-all"
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};

// Componente de Item do Ranking
interface HabitRankItemProps {
    item: {
        habit: Habit;
        completionRate: number;
        completedDays: number;
        possibleDays: number;
    };
    rank: number;
    isBest: boolean;
}

const HabitRankItem: React.FC<HabitRankItemProps> = ({ item, rank, isBest }) => {
    const IconComponent = getIconComponent(item.habit.icon);

    return (
        <div className={`group relative rounded-2xl p-3 flex items-center gap-3 border backdrop-blur-sm transition-all duration-300 ${
            isBest 
                ? 'bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-500/20 hover:border-emerald-500/40' 
                : 'bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/20 hover:border-amber-500/40'
        }`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-xs font-bold text-white">
                #{rank}
            </div>
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${item.habit.color} flex items-center justify-center`}>
                <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{item.habit.name}</p>
                <p className="text-xs text-slate-400">
                    {item.completedDays} de {item.possibleDays} dias
                </p>
            </div>
            <div className="flex-shrink-0 text-right">
                <div className={`text-sm font-bold ${
                    isBest ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                    {item.completionRate.toFixed(0)}%
                </div>
            </div>
            {/* Barra de progresso */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/50 rounded-b-2xl overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${
                        isBest 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${item.completionRate}%` }}
                />
            </div>
        </div>
    );
};

export default Statistics;