export type HabitType = 'boolean' | 'numeric';

export type HabitUnit = 
    | 'none'
    | 'litros'
    | 'ml'
    | 'páginas'
    | 'km'
    | 'metros'
    | 'minutos'
    | 'horas'
    | 'calorias'
    | 'repetições'
    | 'gramas'
    | 'kg'
    | 'copos'
    | 'vezes';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
    createdAt: string;
    type: HabitType;
    unit?: HabitUnit;
    targetValue?: number; // Meta diária para hábitos numéricos
    scheduledTimes?: string[]; // Horários para lembretes (formato HH:MM)
    timeOfDay?: TimeOfDay; // Período do dia recomendado
    reminderEnabled?: boolean; // Se lembretes estão ativos
}

export interface Completion {
    id: string;
    habitId: string;
    date: string; // YYYY-MM-DD
    value?: number; // Para hábitos numéricos
}

export type View = 'dashboard' | 'stats' | 'calendar' | 'achievements' | 'add';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    evaluate: (habits: Habit[], completions: Completion[]) => boolean;
}
