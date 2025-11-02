import React, { useState } from 'react';
import type { Habit, HabitType, HabitUnit, TimeOfDay } from '../types';
import { HABIT_ICONS, HABIT_COLORS, HABIT_UNITS, TIME_OF_DAY_OPTIONS } from '../constants';
import { getIconComponent, XIcon, ClockIcon, BellIcon } from './icons';
import TimePickerModal from './TimePickerModal';

interface EditHabitModalProps {
    habit: Habit;
    onClose: () => void;
    onSave: (habitId: string, updates: Partial<Habit>) => void;
}

type Tab = 'general' | 'schedule' | 'appearance';

const EditHabitModal: React.FC<EditHabitModalProps> = ({ habit, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [name, setName] = useState(habit.name);
    const [selectedIcon, setSelectedIcon] = useState(habit.icon);
    const [selectedColor, setSelectedColor] = useState(habit.color);
    const [habitType, setHabitType] = useState<HabitType>(habit.type);
    const [unit, setUnit] = useState<HabitUnit>(habit.unit || 'none');
    const [targetValue, setTargetValue] = useState<string>(habit.targetValue?.toString() || '1');
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(habit.timeOfDay || 'anytime');
    const [scheduledTimes, setScheduledTimes] = useState<string[]>(habit.scheduledTimes || []);
    const [reminderEnabled, setReminderEnabled] = useState(habit.reminderEnabled !== false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [error, setError] = useState('');

    const hasChanges = 
        name !== habit.name ||
        selectedIcon !== habit.icon ||
        selectedColor !== habit.color ||
        habitType !== habit.type ||
        unit !== (habit.unit || 'none') ||
        targetValue !== (habit.targetValue?.toString() || '1') ||
        timeOfDay !== (habit.timeOfDay || 'anytime') ||
        JSON.stringify(scheduledTimes) !== JSON.stringify(habit.scheduledTimes || []) ||
        reminderEnabled !== (habit.reminderEnabled !== false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 3) {
            setError('O nome do hábito deve ter pelo menos 3 caracteres.');
            return;
        }
        
        const updates: Partial<Habit> = {
            name: name.trim(),
            icon: selectedIcon,
            color: selectedColor,
            type: habitType,
            timeOfDay,
            scheduledTimes,
            reminderEnabled,
        };
        
        if (habitType === 'numeric') {
            updates.unit = unit;
            updates.targetValue = parseFloat(targetValue) || 1;
        } else {
            updates.unit = undefined;
            updates.targetValue = undefined;
        }
        
        onSave(habit.id, updates);
    };
    
    const IconComponent = getIconComponent(selectedIcon);

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'general', label: 'Geral', icon: '⚙️' },
        { id: 'schedule', label: 'Agenda', icon: '🕐' },
        { id: 'appearance', label: 'Aparência', icon: '🎨' }
    ];

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-700/50 max-h-[95vh] overflow-hidden flex flex-col animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedColor} shadow-xl relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                <IconComponent className="w-8 h-8 text-white relative z-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Editar Hábito</h2>
                                <p className="text-sm text-slate-400">Personalize seu hábito</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-2 bg-slate-800/30 rounded-2xl p-1.5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conteúdo */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-slide-up">
                            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Tab: Geral */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Preview */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border-2 border-slate-700/50">
                                <div className="text-center">
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 ${selectedColor} shadow-2xl relative overflow-hidden group`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <IconComponent className="w-10 h-10 text-white relative z-10" />
                                    </div>
                                    <div className="text-xl font-bold text-white mb-1">{name || 'Seu hábito'}</div>
                                    <div className="text-sm text-slate-400">
                                        {habitType === 'boolean' ? 'Hábito Sim/Não' : `${targetValue} ${unit !== 'none' ? unit : ''} por dia`}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit-habit-name" className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">1</span>
                                    Nome do Hábito
                                </label>
                                <input
                                    id="edit-habit-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="Ex: Ler 1 capítulo"
                                    className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-lg"
                                    autoFocus
                                />
                                <p className="text-xs text-slate-500 mt-2 ml-1">
                                    Mínimo de 3 caracteres ({name.length}/3)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">2</span>
                                    Tipo de Hábito
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setHabitType('boolean')}
                                        className={`relative px-5 py-5 rounded-2xl font-semibold transition-all duration-300 overflow-hidden group ${
                                            habitType === 'boolean'
                                                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-2 border-slate-700/50 hover:border-slate-600/50 active:scale-95'
                                        }`}
                                    >
                                        {habitType === 'boolean' && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                        )}
                                        <div className="relative z-10">
                                            <div className="text-2xl mb-2">✓</div>
                                            <div className="text-base">Sim/Não</div>
                                            <div className="text-xs opacity-80 mt-1">Feito ou não feito</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHabitType('numeric')}
                                        className={`relative px-5 py-5 rounded-2xl font-semibold transition-all duration-300 overflow-hidden group ${
                                            habitType === 'numeric'
                                                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-2 border-slate-700/50 hover:border-slate-600/50 active:scale-95'
                                        }`}
                                    >
                                        {habitType === 'numeric' && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                        )}
                                        <div className="relative z-10">
                                            <div className="text-2xl mb-2">123</div>
                                            <div className="text-base">Numérico</div>
                                            <div className="text-xs opacity-80 mt-1">Quantidade ou valor</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {habitType === 'numeric' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-habit-unit" className="block text-sm font-semibold text-slate-300 mb-3">
                                            Unidade de Medida
                                        </label>
                                        <select
                                            id="edit-habit-unit"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value as HabitUnit)}
                                            className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 appearance-none cursor-pointer"
                                        >
                                            {HABIT_UNITS.map((u) => (
                                                <option key={u.value} value={u.value}>
                                                    {u.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="edit-habit-target" className="block text-sm font-semibold text-slate-300 mb-3">
                                            Meta Diária
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="edit-habit-target"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={targetValue}
                                                onChange={(e) => setTargetValue(e.target.value)}
                                                className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 pr-16"
                                                placeholder="0"
                                                required
                                            />
                                            {unit !== 'none' && (
                                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                                                    {unit}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Agenda */}
                    {activeTab === 'schedule' && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-xs font-bold">1</span>
                                    Período do Dia
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {TIME_OF_DAY_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setTimeOfDay(option.value)}
                                            className={`relative px-4 py-4 rounded-2xl transition-all duration-300 text-left overflow-hidden group ${
                                                timeOfDay === option.value
                                                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-600/20 border-2 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                                    : 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-slate-600/50 active:scale-95'
                                            }`}
                                        >
                                            {timeOfDay === option.value && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                                            )}
                                            <div className="flex items-center gap-3 relative z-10">
                                                <span className="text-2xl">{option.icon}</span>
                                                <div>
                                                    <div className={`font-semibold text-sm ${timeOfDay === option.value ? 'text-white' : 'text-slate-300'}`}>
                                                        {option.label}
                                                    </div>
                                                    <div className={`text-xs ${timeOfDay === option.value ? 'text-purple-300' : 'text-slate-500'}`}>
                                                        {option.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lembretes */}
                            <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                            <BellIcon className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <div>Lembretes</div>
                                            <div className="text-xs text-slate-500 font-normal">Receba notificações</div>
                                        </div>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setReminderEnabled(!reminderEnabled)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                                            reminderEnabled ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                                reminderEnabled ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                                
                                {reminderEnabled && (
                                    <button
                                        type="button"
                                        onClick={() => setShowTimePicker(true)}
                                        className="w-full bg-slate-800/50 hover:bg-slate-700/50 border-2 border-slate-700/50 hover:border-cyan-500/50 rounded-2xl px-4 py-4 text-white flex items-center justify-between transition-all duration-300 active:scale-95"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                                <ClockIcon className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div className="text-left">
                                                <span className="text-sm font-semibold block">
                                                    {scheduledTimes.length > 0 
                                                        ? `${scheduledTimes.length} horário${scheduledTimes.length > 1 ? 's' : ''} configurado${scheduledTimes.length > 1 ? 's' : ''}`
                                                        : 'Definir horários'}
                                                </span>
                                                {scheduledTimes.length > 0 && (
                                                    <span className="text-slate-400 text-xs block mt-0.5">
                                                        {scheduledTimes.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: Aparência */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Preview */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border-2 border-slate-700/50">
                                <div className="text-center">
                                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 ${selectedColor} shadow-2xl relative overflow-hidden group transition-all duration-300`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <IconComponent className="w-12 h-12 text-white relative z-10" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{name}</div>
                                    <div className="text-sm text-slate-400">
                                        {habitType === 'boolean' ? 'Hábito Sim/Não' : `${targetValue} ${unit !== 'none' ? unit : ''} por dia`}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 text-xs font-bold">1</span>
                                    Escolha um Ícone
                                </label>
                                <div className="grid grid-cols-8 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar p-2">
                                    {HABIT_ICONS.map(icon => {
                                        const Icon = getIconComponent(icon);
                                        return (
                                            <button
                                                type="button"
                                                key={icon}
                                                onClick={() => setSelectedIcon(icon)}
                                                className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 group ${
                                                    selectedIcon === icon 
                                                        ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-xl shadow-pink-500/30 scale-110 ring-2 ring-pink-400/50' 
                                                        : 'bg-slate-800/50 hover:bg-slate-700/50 border-2 border-slate-700/50 hover:border-slate-600/50 active:scale-95'
                                                }`}
                                            >
                                                <Icon className={`w-5 h-5 ${selectedIcon === icon ? 'text-white' : 'text-slate-400'}`} />
                                                {selectedIcon === icon && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 text-xs font-bold">2</span>
                                    Escolha uma Cor
                                </label>
                                <div className="grid grid-cols-9 gap-2.5">
                                   {HABIT_COLORS.map(color => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`relative w-full aspect-square rounded-xl ${color} transition-all duration-300 shadow-lg group ${
                                                selectedColor === color 
                                                    ? 'scale-110 ring-4 ring-white/40 ring-offset-2 ring-offset-slate-900' 
                                                    : 'hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            {selectedColor === color && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-slate-700/50 bg-slate-900/50 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border-2 border-slate-700/50 hover:border-slate-600/50 text-white font-semibold rounded-2xl transition-all duration-300 active:scale-95"
                    >
                        Cancelar
                    </button>
                    
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={!hasChanges}
                        className={`flex-1 px-6 py-3 font-bold rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
                            hasChanges
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50'
                                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Salvar Alterações
                    </button>
                </div>

                {/* Time Picker Modal */}
                <TimePickerModal
                    open={showTimePicker}
                    scheduledTimes={scheduledTimes}
                    onClose={() => setShowTimePicker(false)}
                    onConfirm={(times) => setScheduledTimes(times)}
                />
            </div>
        </div>
    );
};

export default EditHabitModal;
