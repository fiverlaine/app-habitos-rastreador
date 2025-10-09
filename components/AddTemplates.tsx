import React, { useMemo, useState } from 'react';
import type { Habit } from '../types';
import { HABIT_TEMPLATES } from '../constants';
import { getIconComponent, XIcon, PlusIcon } from './icons';

interface AddTemplatesProps {
    onBack: () => void;
    onCreateFromTemplate: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
    onCreateCustom: () => void;
}

const categories = [
    'Popular',
    'Exercício',
    'Meditação',
    'Leitura',
    'Alimentação',
    'Bem-estar',
    'Estudo',
    'Rotina'
] as const;

const AddTemplates: React.FC<AddTemplatesProps> = ({ onBack, onCreateFromTemplate, onCreateCustom }) => {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('Popular');

    const filteredTemplates = useMemo(() => {
        return HABIT_TEMPLATES.filter(t =>
            (activeCategory ? t.category === activeCategory : true) &&
            (query ? t.name.toLowerCase().includes(query.toLowerCase()) : true)
        );
    }, [activeCategory, query]);

    const createFromTemplate = (tpl: typeof HABIT_TEMPLATES[number]) => {
        const habit: Omit<Habit, 'id' | 'createdAt'> = {
            name: tpl.name,
            icon: tpl.icon,
            color: tpl.color,
            type: tpl.type,
            unit: tpl.unit,
            targetValue: tpl.targetValue,
        };
        onCreateFromTemplate(habit);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="text-slate-300 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-bold text-white">Adicionar</h2>
                <div className="w-6" />
            </div>

            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar hábito..."
                    className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-400"
                />
            </div>

            <div className="flex items-center gap-3 overflow-auto no-scrollbar pb-1">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex flex-col items-center justify-center min-w-[84px] gap-2`}
                    >
                        <div className={`w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center ${activeCategory === cat ? 'ring-2 ring-teal-400' : ''}`}>
                            <PlusIcon className="w-6 h-6 text-teal-400" />
                        </div>
                        <span className="text-xs text-slate-300">{cat}</span>
                    </button>
                ))}
            </div>

            <div>
                <h3 className="text-white font-semibold mb-2">{activeCategory}</h3>
                <p className="text-slate-400 text-xs mb-3">Hábitos mais populares</p>

                <div className="space-y-3 max-h-[52vh] overflow-auto pr-1">
                    {filteredTemplates.map((tpl, i) => {
                        const Icon = getIconComponent(tpl.icon);
                        return (
                            <div key={`${tpl.name}-${i}`} className="bg-slate-800 rounded-xl p-3 border border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tpl.color}`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">{tpl.name}</span>
                                        <span className="text-slate-400 text-xs">
                                            {tpl.type === 'boolean' ? 'Sim/Não' : `${tpl.targetValue} ${tpl.unit && tpl.unit !== 'none' ? tpl.unit : ''}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="text-slate-400 hover:text-white"
                                        title="Adicionar"
                                        onClick={() => createFromTemplate(tpl)}
                                    >
                                        <PlusIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pt-2">
                <button
                    onClick={onCreateCustom}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" /> Criar hábito personalizado
                </button>
            </div>
        </div>
    );
};

export default AddTemplates;


