
import type { HabitUnit, TimeOfDay } from './types';

export const HABIT_ICONS = [
    // Ícones originais
    'Book', 'Water', 'Dumbbell', 'Run', 'Code', 'Meditate', 'Fruit',
    // Novos ícones - Saúde
    'HeartIcon', 'PillIcon', 'FaceSmileIcon',
    // Novos ícones - Alimentação
    'MugIcon', 'CakeIcon',
    // Novos ícones - Exercício
    'BoltIcon',
    // Novos ícones - Trabalho
    'BriefcaseIcon', 'DocumentTextIcon', 'PencilIcon',
    // Novos ícones - Criativo
    'PhotoIcon',
    // Novos ícones - Social
    'UserGroupIcon', 'EnvelopeIcon',
    // Novos ícones - Casa
    'ShoppingBagIcon', 'ShoppingCartIcon',
    // Novos ícones - Outros
    'GiftIcon', 'PuzzleIcon'
];

export const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string; icon: string; description: string }[] = [
    { value: 'morning', label: 'Manhã', icon: '🌅', description: '6h - 12h' },
    { value: 'afternoon', label: 'Tarde', icon: '☀️', description: '12h - 18h' },
    { value: 'evening', label: 'Noite', icon: '🌙', description: '18h - 0h' },
    { value: 'anytime', label: 'Qualquer hora', icon: '⏰', description: 'Sem preferência' },
];
export const HABIT_COLORS = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-teal-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
];

export const HABIT_UNITS: { value: HabitUnit; label: string }[] = [
    { value: 'none', label: 'Nenhuma' },
    { value: 'litros', label: 'Litros' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'páginas', label: 'Páginas' },
    { value: 'km', label: 'Quilômetros' },
    { value: 'metros', label: 'Metros' },
    { value: 'minutos', label: 'Minutos' },
    { value: 'horas', label: 'Horas' },
    { value: 'calorias', label: 'Calorias' },
    { value: 'repetições', label: 'Repetições' },
    { value: 'gramas', label: 'Gramas' },
    { value: 'kg', label: 'Quilogramas' },
    { value: 'copos', label: 'Copos' },
    { value: 'vezes', label: 'Vezes' },
];

// Templates de hábitos pré-configurados (35+)
export type HabitTemplate = {
    name: string;
    icon: string;
    color: string;
    type: 'boolean' | 'numeric';
    unit?: HabitUnit;
    targetValue?: number;
    category: 'Popular' | 'Exercício' | 'Meditação' | 'Leitura' | 'Alimentação' | 'Bem-estar' | 'Estudo' | 'Rotina';
    scheduledTimes?: string[]; // Horários padrão para lembretes
    timeOfDay?: TimeOfDay; // Período do dia recomendado
    reminderEnabled?: boolean; // Se lembretes estão ativos por padrão
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
    // Popular (8)
    { name: 'Caminhar', icon: 'Run', color: 'bg-green-500', type: 'numeric', unit: 'km', targetValue: 3, category: 'Popular', scheduledTimes: ['07:00', '18:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Correr', icon: 'Run', color: 'bg-red-500', type: 'numeric', unit: 'km', targetValue: 5, category: 'Popular', scheduledTimes: ['06:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Treinar', icon: 'Dumbbell', color: 'bg-orange-500', type: 'numeric', unit: 'minutos', targetValue: 45, category: 'Popular', scheduledTimes: ['07:00', '19:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Yoga', icon: 'Meditate', color: 'bg-teal-500', type: 'numeric', unit: 'minutos', targetValue: 30, category: 'Popular', scheduledTimes: ['07:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Meditar', icon: 'Meditate', color: 'bg-purple-500', type: 'numeric', unit: 'minutos', targetValue: 10, category: 'Popular', scheduledTimes: ['07:00', '21:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Beber água', icon: 'Water', color: 'bg-blue-500', type: 'numeric', unit: 'litros', targetValue: 2, category: 'Popular', scheduledTimes: ['08:00', '12:00', '15:00', '18:00', '21:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Ler', icon: 'Book', color: 'bg-yellow-500', type: 'numeric', unit: 'páginas', targetValue: 10, category: 'Popular', scheduledTimes: ['20:00'], timeOfDay: 'evening', reminderEnabled: true },
    { name: 'Dormir cedo', icon: 'StarIcon', color: 'bg-indigo-500', type: 'boolean', category: 'Popular', scheduledTimes: ['22:00'], timeOfDay: 'evening', reminderEnabled: true },

    // Exercício (7)
    { name: 'Exercício HIIT', icon: 'Dumbbell', color: 'bg-red-500', type: 'numeric', unit: 'minutos', targetValue: 20, category: 'Exercício', scheduledTimes: ['07:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Alongar', icon: 'Dumbbell', color: 'bg-pink-500', type: 'numeric', unit: 'minutos', targetValue: 15, category: 'Exercício', scheduledTimes: ['07:00', '19:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Abdominais', icon: 'Dumbbell', color: 'bg-orange-500', type: 'numeric', unit: 'repetições', targetValue: 50, category: 'Exercício', scheduledTimes: ['07:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Flexões', icon: 'Dumbbell', color: 'bg-yellow-500', type: 'numeric', unit: 'repetições', targetValue: 30, category: 'Exercício', scheduledTimes: ['07:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Bicicleta', icon: 'Run', color: 'bg-teal-500', type: 'numeric', unit: 'km', targetValue: 10, category: 'Exercício', scheduledTimes: ['07:00', '18:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Subir escadas', icon: 'Run', color: 'bg-indigo-500', type: 'numeric', unit: 'minutos', targetValue: 10, category: 'Exercício', scheduledTimes: ['12:00'], timeOfDay: 'afternoon', reminderEnabled: true },
    { name: 'Caminhada leve', icon: 'Run', color: 'bg-green-500', type: 'numeric', unit: 'minutos', targetValue: 30, category: 'Exercício', scheduledTimes: ['18:00'], timeOfDay: 'evening', reminderEnabled: true },

    // Meditação e Bem-estar (6)
    { name: 'Respiração guiada', icon: 'Meditate', color: 'bg-teal-500', type: 'numeric', unit: 'minutos', targetValue: 5, category: 'Meditação', scheduledTimes: ['07:00', '21:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Gratidão', icon: 'StarIcon', color: 'bg-yellow-500', type: 'boolean', category: 'Meditação', scheduledTimes: ['21:00'], timeOfDay: 'evening', reminderEnabled: true },
    { name: 'Diário', icon: 'Book', color: 'bg-purple-500', type: 'numeric', unit: 'páginas', targetValue: 3, category: 'Bem-estar', scheduledTimes: ['21:00'], timeOfDay: 'evening', reminderEnabled: true },
    { name: 'Tempo offline', icon: 'Code', color: 'bg-slate-500', type: 'numeric', unit: 'minutos', targetValue: 60, category: 'Bem-estar', scheduledTimes: ['20:00'], timeOfDay: 'evening', reminderEnabled: true },
    { name: 'Alongamento matinal', icon: 'Dumbbell', color: 'bg-orange-500', type: 'numeric', unit: 'minutos', targetValue: 10, category: 'Bem-estar', scheduledTimes: ['07:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Dormir 8h', icon: 'StarIcon', color: 'bg-indigo-500', type: 'boolean', category: 'Bem-estar', scheduledTimes: ['22:00'], timeOfDay: 'evening', reminderEnabled: true },

    // Leitura e Estudo (6)
    { name: 'Ler livro', icon: 'Book', color: 'bg-yellow-500', type: 'numeric', unit: 'páginas', targetValue: 15, category: 'Leitura', scheduledTimes: ['20:00'], timeOfDay: 'evening', reminderEnabled: true },
    { name: 'Estudar programação', icon: 'Code', color: 'bg-indigo-500', type: 'numeric', unit: 'minutos', targetValue: 60, category: 'Estudo', scheduledTimes: ['09:00', '14:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Curso online', icon: 'Code', color: 'bg-blue-500', type: 'numeric', unit: 'minutos', targetValue: 45, category: 'Estudo', scheduledTimes: ['10:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Revisão Anki', icon: 'Book', color: 'bg-green-500', type: 'numeric', unit: 'minutos', targetValue: 20, category: 'Estudo', scheduledTimes: ['08:00', '20:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Escrever artigo', icon: 'Book', color: 'bg-purple-500', type: 'numeric', unit: 'páginas', targetValue: 2, category: 'Estudo', scheduledTimes: ['09:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Praticar inglês', icon: 'Code', color: 'bg-teal-500', type: 'numeric', unit: 'minutos', targetValue: 30, category: 'Estudo', scheduledTimes: ['19:00'], timeOfDay: 'evening', reminderEnabled: true },

    // Alimentação (5)
    { name: 'Comer fruta', icon: 'Fruit', color: 'bg-green-500', type: 'numeric', unit: 'vezes', targetValue: 2, category: 'Alimentação', scheduledTimes: ['10:00', '16:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Sem açúcar', icon: 'StarIcon', color: 'bg-red-500', type: 'boolean', category: 'Alimentação', scheduledTimes: ['08:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Café da manhã saudável', icon: 'Fruit', color: 'bg-yellow-500', type: 'boolean', category: 'Alimentação', scheduledTimes: ['08:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Contar calorias', icon: 'Dumbbell', color: 'bg-orange-500', type: 'numeric', unit: 'calorias', targetValue: 1800, category: 'Alimentação', scheduledTimes: ['12:00', '19:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Beber chá', icon: 'Water', color: 'bg-blue-500', type: 'numeric', unit: 'copos', targetValue: 2, category: 'Alimentação', scheduledTimes: ['15:00', '20:00'], timeOfDay: 'anytime', reminderEnabled: true },

    // Rotina (6)
    { name: 'Arrumar cama', icon: 'StarIcon', color: 'bg-teal-500', type: 'boolean', category: 'Rotina', scheduledTimes: ['07:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Organizar tarefas', icon: 'StarIcon', color: 'bg-indigo-500', type: 'boolean', category: 'Rotina', scheduledTimes: ['08:00'], timeOfDay: 'morning', reminderEnabled: true },
    { name: 'Limpeza rápida', icon: 'StarIcon', color: 'bg-slate-500', type: 'numeric', unit: 'minutos', targetValue: 15, category: 'Rotina', scheduledTimes: ['18:00'], timeOfDay: 'evening', reminderEnabled: true },
    { name: 'Sem redes 1h', icon: 'Code', color: 'bg-slate-500', type: 'numeric', unit: 'minutos', targetValue: 60, category: 'Rotina', scheduledTimes: ['20:00'], timeOfDay: 'evening', reminderEnabled: true },
    { name: 'Passeio com pet', icon: 'Run', color: 'bg-green-500', type: 'numeric', unit: 'minutos', targetValue: 20, category: 'Rotina', scheduledTimes: ['07:00', '18:00'], timeOfDay: 'anytime', reminderEnabled: true },
    { name: 'Beber água ao acordar', icon: 'Water', color: 'bg-blue-500', type: 'numeric', unit: 'copos', targetValue: 1, category: 'Rotina', scheduledTimes: ['07:00'], timeOfDay: 'morning', reminderEnabled: true },
];
