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
            scheduledTimes: tpl.scheduledTimes || [],
            timeOfDay: tpl.timeOfDay || 'anytime',
            reminderEnabled: tpl.reminderEnabled !== false,
        };
        onCreateFromTemplate(habit);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)] animate-fade-in">
            {/* Header fixo */}
            <div className="flex-shrink-0 space-y-4 mb-4">
                <div className="flex items-center justify-between px-1">
                    <button 
                        onClick={onBack} 
                        className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Adicionar Hábito</h2>
                    <div className="w-10" />
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-sm">
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar hábito..."
                        className="w-full bg-transparent outline-none text-white placeholder-slate-500 font-medium text-sm"
                    />
                </div>

                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex flex-col items-center justify-center min-w-[80px] gap-1.5 transition-all duration-300 flex-shrink-0 ${activeCategory === cat ? 'scale-105' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                activeCategory === cat 
                                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-500/20' 
                                    : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50'
                            }`}>
                                <PlusIcon className={`w-5 h-5 ${activeCategory === cat ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <span className={`text-[10px] font-semibold transition-colors ${activeCategory === cat ? 'text-white' : 'text-slate-400'}`}>{cat}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-shrink-0">
                    <h3 className="text-white font-bold text-base mb-0.5">{activeCategory}</h3>
                    <p className="text-slate-500 text-xs">Hábitos mais populares</p>
                </div>
            </div>

            {/* Área de scroll apenas para templates */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
                    <div className="space-y-2.5">
                        {filteredTemplates.map((tpl, i) => {
                            const Icon = getIconComponent(tpl.icon);
                            return (
                                <div 
                                    key={`${tpl.name}-${i}`} 
                                    className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-3 border border-slate-800/50 flex items-center justify-between hover:border-slate-700/70 transition-all duration-300 hover:scale-[1.01] group"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tpl.color} shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <Icon className="w-5 h-5 text-white relative z-10" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-white font-semibold text-sm truncate">{tpl.name}</span>
                                            <span className="text-slate-400 text-xs">
                                                {tpl.type === 'boolean' ? 'Sim/Não' : `${tpl.targetValue} ${tpl.unit && tpl.unit !== 'none' ? tpl.unit : ''}`}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-90 flex-shrink-0 ml-2"
                                        title="Adicionar"
                                        onClick={() => createFromTemplate(tpl)}
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Botão fixo na parte inferior */}
            <div className="flex-shrink-0 pt-3 mt-3 border-t border-slate-800/50">
                <button
                    onClick={onCreateCustom}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-95 text-sm"
                >
                    <PlusIcon className="w-4 h-4" /> Criar hábito personalizado
                </button>
            </div>
        </div>
    );
};

export default AddTemplates;


