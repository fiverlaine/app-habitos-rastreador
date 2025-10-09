import type { Habit, Completion, Achievement } from '../types';
import { calculateStreak } from './streak';

export const achievementsList: Achievement[] = [
    {
        id: 'FIRST_HABIT',
        name: 'Primeiros Passos',
        description: 'Crie seu primeiro hábito.',
        icon: 'PlusIcon',
        evaluate: (habits, completions) => habits.length >= 1,
    },
    {
        id: 'FIVE_HABITS',
        name: 'Colecionador',
        description: 'Tenha 5 hábitos ativos ao mesmo tempo.',
        icon: 'ChartBarIcon',
        evaluate: (habits, completions) => habits.length >= 5,
    },
    {
        id: 'FIRST_COMPLETION',
        name: 'Começou!',
        description: 'Complete um hábito pela primeira vez.',
        icon: 'CheckIcon',
        evaluate: (habits, completions) => completions.length >= 1,
    },
    {
        id: 'PERFECT_DAY',
        name: 'Dia Perfeito',
        description: 'Complete todos os seus hábitos em um único dia.',
        icon: 'StarIcon',
        evaluate: (habits, completions) => {
            const completionsByDate: Record<string, string[]> = completions.reduce((acc, c) => {
                if (!acc[c.date]) {
                    acc[c.date] = [];
                }
                acc[c.date].push(c.habitId);
                return acc;
            }, {} as Record<string, string[]>);

            for (const date in completionsByDate) {
                const habitsOnThatDay = habits.filter(h => new Date(h.createdAt).toISOString().split('T')[0] <= date);
                if (habitsOnThatDay.length >= 2) {
                    const completedOnThatDay = new Set(completionsByDate[date]);
                    if (habitsOnThatDay.every(h => completedOnThatDay.has(h.id))) {
                        return true; // Found at least one perfect day
                    }
                }
            }
            return false;
        },
    },
    {
        id: 'STREAK_7',
        name: 'Em Chamas!',
        description: 'Alcance uma sequência de 7 dias em qualquer hábito.',
        icon: 'FireIcon',
        evaluate: (habits, completions) => {
            return habits.some(habit => {
                const habitCompletions = completions.filter(c => c.habitId === habit.id).map(c => c.date);
                const { longestStreak } = calculateStreak(habitCompletions);
                return longestStreak >= 7;
            });
        },
    },
    {
        id: 'STREAK_30',
        name: 'Imparável',
        description: 'Alcance uma sequência de 30 dias em qualquer hábito.',
        icon: 'FireIcon',
        evaluate: (habits, completions) => {
             return habits.some(habit => {
                const habitCompletions = completions.filter(c => c.habitId === habit.id).map(c => c.date);
                const { longestStreak } = calculateStreak(habitCompletions);
                return longestStreak >= 30;
            });
        },
    },
    {
        id: 'STREAK_100',
        name: 'Lenda Viva',
        description: 'Alcance uma sequência de 100 dias em qualquer hábito.',
        icon: 'TrophyIcon',
        evaluate: (habits, completions) => {
            return habits.some(habit => {
                const habitCompletions = completions.filter(c => c.habitId === habit.id).map(c => c.date);
                const { longestStreak } = calculateStreak(habitCompletions);
                return longestStreak >= 100;
            });
        },
    },
    {
        id: 'LEVEL_10',
        name: 'Mestre dos Hábitos',
        description: 'Alcance o nível 10.',
        icon: 'Dumbbell',
        evaluate: (habits, completions) => {
            const points = completions.length * 10;
            const level = Math.floor(Math.pow(points / 100, 0.7)) + 1;
            return level >= 10;
        },
    },
];
