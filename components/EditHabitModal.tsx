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

const EditHabitModal: React.FC<EditHabitModalProps> = ({ habit, onClose, onSave }) => {
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

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-7 w-full max-w-lg shadow-2xl border border-slate-800/50 max-h-[90vh] overflow-y-auto animate-scale-in custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-7">
                    <h2 className="text-2xl font-bold text-white">Editar Hábito</h2>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center">
                       <div className={`w-28 h-28 rounded-3xl flex items-center justify-center mx-auto ${selectedColor} mb-5 shadow-2xl relative overflow-hidden group`}>
                           <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                           <IconComponent className="w-14 h-14 text-white relative z-10" />
                       </div>
                    </div>

                    <div>
                        <label htmlFor="edit-habit-name" className="block text-sm font-semibold text-slate-300 mb-2.5">Nome do Hábito</label>
                        <input
                            id="edit-habit-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Ex: Ler 1 capítulo"
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                            required
                        />
                         {error && <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Tipo de Hábito</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setHabitType('boolean')}
                                className={`relative px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                                    habitType === 'boolean'
                                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 active:scale-95'
                                }`}
                            >
                                {habitType === 'boolean' && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                )}
                                <span className="relative z-10">Sim/Não</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setHabitType('numeric')}
                                className={`relative px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                                    habitType === 'numeric'
                                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 active:scale-95'
                                }`}
                            >
                                {habitType === 'numeric' && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                )}
                                <span className="relative z-10">Numérico</span>
                            </button>
                        </div>
                    </div>

                    {habitType === 'numeric' && (
                        <>
                            <div>
                                <label htmlFor="edit-habit-unit" className="block text-sm font-semibold text-slate-300 mb-2.5">Unidade de Medida</label>
                                <select
                                    id="edit-habit-unit"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value as HabitUnit)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 appearance-none cursor-pointer"
                                >
                                    {HABIT_UNITS.map((u) => (
                                        <option key={u.value} value={u.value}>
                                            {u.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="edit-habit-target" className="block text-sm font-semibold text-slate-300 mb-2.5">Meta Diária</label>
                                <input
                                    id="edit-habit-target"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={targetValue}
                                    onChange={(e) => setTargetValue(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Período do Dia */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Período do Dia</label>
                        <div className="grid grid-cols-2 gap-3">
                            {TIME_OF_DAY_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setTimeOfDay(option.value)}
                                    className={`relative px-3 py-3.5 rounded-2xl transition-all duration-300 text-left overflow-hidden ${
                                        timeOfDay === option.value
                                            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                                            : 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-slate-600/50 active:scale-95'
                                    }`}
                                >
                                    {timeOfDay === option.value && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>
                                    )}
                                    <div className="flex items-center gap-2.5 relative z-10">
                                        <span className="text-2xl">{option.icon}</span>
                                        <div>
                                            <div className={`font-semibold ${timeOfDay === option.value ? 'text-white' : 'text-slate-300'}`}>
                                                {option.label}
                                            </div>
                                            <div className={`text-xs ${timeOfDay === option.value ? 'text-cyan-300' : 'text-slate-500'}`}>
                                                {option.description}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lembretes */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                    <BellIcon className="w-4 h-4 text-cyan-400" />
                                </div>
                                Lembretes
                            </label>
                            <button
                                type="button"
                                onClick={() => setReminderEnabled(!reminderEnabled)}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                                    reminderEnabled ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700'
                                }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                        reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        
                        {reminderEnabled && (
                            <button
                                type="button"
                                onClick={() => setShowTimePicker(true)}
                                className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-2xl px-4 py-4 text-white flex items-center justify-between transition-all duration-300 active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                        <ClockIcon className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-semibold block">
                                            {scheduledTimes.length > 0 
                                                ? `${scheduledTimes.length} horário${scheduledTimes.length > 1 ? 's' : ''}`
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

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Ícone</label>
                        <div className="grid grid-cols-7 gap-2.5">
                            {HABIT_ICONS.map(icon => (
                                <button
                                    type="button"
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
                                        selectedIcon === icon 
                                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/30 scale-105' 
                                            : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 active:scale-95'
                                    }`}
                                >
                                    {React.createElement(getIconComponent(icon), { className: 'w-5 h-5 text-white' })}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Cor</label>
                        <div className="grid grid-cols-9 gap-2.5">
                           {HABIT_COLORS.map(color => (
                                <button
                                    type="button"
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`relative w-full aspect-square rounded-xl ${color} transition-all duration-300 shadow-lg ${
                                        selectedColor === color 
                                            ? 'scale-105 ring-4 ring-white/30' 
                                            : 'hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    {selectedColor === color && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Salvar
                        </button>
                    </div>
                </form>

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

