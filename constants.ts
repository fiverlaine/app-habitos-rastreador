import type { HabitUnit, TimeOfDay } from './types';

export const HABIT_ICONS = ['Book', 'Water', 'Dumbbell', 'Run', 'Code', 'Meditate', 'Fruit'] as const;

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
] as const;

export const TIME_OF_DAY_OPTIONS: Array<{ value: TimeOfDay; label: string; icon: string; description: string }> = [
    { value: 'morning', label: 'Manhã', icon: '🌅', description: '6h - 12h' },
    { value: 'afternoon', label: 'Tarde', icon: '☀️', description: '12h - 18h' },
    { value: 'evening', label: 'Noite', icon: '🌙', description: '18h - 0h' },
    { value: 'anytime', label: 'Qualquer hora', icon: '⏰', description: 'Sem preferência' },
];

export const HABIT_UNITS: Array<{ value: HabitUnit; label: string }> = [
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
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
    // Popular (8)
    { name: 'Caminhar', icon: 'Run', color: 'bg-green-500', type: 'numeric', unit: 'km', targetValue: 3, category: 'Popular' },
    { name: 'Correr', icon: 'Run', color: 'bg-red-500', type: 'numeric', unit: 'km', targetValue: 5, category: 'Popular' },
    { name: 'Treinar', icon: 'Dumbbell', color: 'bg-orange-500', type: 'numeric', unit: 'minutos', targetValue: 45, category: 'Popular' },
    { name: 'Yoga', icon: 'Meditate', color: 'bg-teal-500', type: 'numeric', unit: 'minutos', targetValue: 30, category: 'Popular' },
    { name: 'Meditar', icon: 'Meditate', color: 'bg-purple-500', type: 'numeric', unit: 'minutos', targetValue: 10, category: 'Popular' },
    { name: 'Beber água', icon: 'Water', color: 'bg-blue-500', type: 'numeric', unit: 'litros', targetValue: 2, category: 'Popular' },
    { name: 'Ler', icon: 'Book', color: 'bg-yellow-500', type: 'numeric', unit: 'páginas', targetValue: 10, category: 'Popular' },
    { name: 'Dormir cedo', icon: 'StarIcon', color: 'bg-indigo-500', type: 'boolean', category: 'Popular' },

    // Exercício (7)
    { name: 'Exercício HIIT', icon: 'Dumbbell', color: 'bg-red-500', type: 'numeric', unit: 'minutos', targetValue: 20, category: 'Exercício' },
    { name: 'Alongar', icon: 'Dumbbell', color: 'bg-pink-500', type: 'numeric', unit: 'minutos', targetValue: 15, category: 'Exercício' },
    { name: 'Abdominais', icon: 'Dumbbell', color: 'bg-orange-500', type: 'numeric', unit: 'repetições', targetValue: 50, category: 'Exercício' },
    { name: 'Flexões', icon: 'Dumbbell', color: 'bg-yellow-500', type: 'numeric', unit: 'repetições', targetValue: 30, category: 'Exercício' },
    { name: 'Bicicleta', icon: 'Run', color: 'bg-teal-500', type: 'numeric', unit: 'km', targetValue: 10, category: 'Exercício' },
    { name: 'Subir escadas', icon: 'Run', color: 'bg-indigo-500', type: 'numeric', unit: 'minutos', targetValue: 10, category: 'Exercício' },
    { name: 'Caminhada leve', icon: 'Run', color: 'bg-green-500', type: 'numeric', unit: 'minutos', targetValue: 30, category: 'Exercício' },

    // Meditação e Bem-estar (6)
    { name: 'Respiração guiada', icon: 'Meditate', color: 'bg-teal-500', type: 'numeric', unit: 'minutos', targetValue: 5, category: 'Meditação' },
    { name: 'Gratidão', icon: 'StarIcon', color: 'bg-yellow-500', type: 'boolean', category: 'Meditação' },
    { name: 'Diário', icon: 'Book', color: 'bg-purple-500', type: 'numeric', unit: 'páginas', targetValue: 3, category: 'Bem-estar' },
    { name: 'Tempo offline', icon: 'Code', color: 'bg-slate-500', type: 'numeric', unit: 'minutos', targetValue: 60, category: 'Bem-estar' },
    { name: 'Alongamento matinal', icon: 'Dumbbell', color: 'bg-orange-500', type: 'numeric', unit: 'minutos', targetValue: 10, category: 'Bem-estar' },
    { name: 'Dormir 8h', icon: 'StarIcon', color: 'bg-indigo-500', type: 'boolean', category: 'Bem-estar' },

    // Leitura e Estudo (6)
    { name: 'Ler livro', icon: 'Book', color: 'bg-yellow-500', type: 'numeric', unit: 'páginas', targetValue: 15, category: 'Leitura' },
    { name: 'Estudar programação', icon: 'Code', color: 'bg-indigo-500', type: 'numeric', unit: 'minutos', targetValue: 60, category: 'Estudo' },
    { name: 'Curso online', icon: 'Code', color: 'bg-blue-500', type: 'numeric', unit: 'minutos', targetValue: 45, category: 'Estudo' },
    { name: 'Revisão Anki', icon: 'Book', color: 'bg-green-500', type: 'numeric', unit: 'minutos', targetValue: 20, category: 'Estudo' },
    { name: 'Escrever artigo', icon: 'Book', color: 'bg-purple-500', type: 'numeric', unit: 'páginas', targetValue: 2, category: 'Estudo' },
    { name: 'Praticar inglês', icon: 'Code', color: 'bg-teal-500', type: 'numeric', unit: 'minutos', targetValue: 30, category: 'Estudo' },

    // Alimentação (5)
    { name: 'Comer fruta', icon: 'Fruit', color: 'bg-green-500', type: 'numeric', unit: 'vezes', targetValue: 2, category: 'Alimentação' },
    { name: 'Sem açúcar', icon: 'StarIcon', color: 'bg-red-500', type: 'boolean', category: 'Alimentação' },
    { name: 'Café da manhã saudável', icon: 'Fruit', color: 'bg-yellow-500', type: 'boolean', category: 'Alimentação' },
    { name: 'Contar calorias', icon: 'Dumbbell', color: 'bg-orange-500', type: 'numeric', unit: 'calorias', targetValue: 1800, category: 'Alimentação' },
    { name: 'Beber chá', icon: 'Water', color: 'bg-blue-500', type: 'numeric', unit: 'copos', targetValue: 2, category: 'Alimentação' },

    // Rotina (6)
    { name: 'Arrumar cama', icon: 'StarIcon', color: 'bg-teal-500', type: 'boolean', category: 'Rotina' },
    { name: 'Organizar tarefas', icon: 'StarIcon', color: 'bg-indigo-500', type: 'boolean', category: 'Rotina' },
    { name: 'Limpeza rápida', icon: 'StarIcon', color: 'bg-slate-500', type: 'numeric', unit: 'minutos', targetValue: 15, category: 'Rotina' },
    { name: 'Sem redes 1h', icon: 'Code', color: 'bg-slate-500', type: 'numeric', unit: 'minutos', targetValue: 60, category: 'Rotina' },
    { name: 'Passeio com pet', icon: 'Run', color: 'bg-green-500', type: 'numeric', unit: 'minutos', targetValue: 20, category: 'Rotina' },
    { name: 'Beber água ao acordar', icon: 'Water', color: 'bg-blue-500', type: 'numeric', unit: 'copos', targetValue: 1, category: 'Rotina' },
];
