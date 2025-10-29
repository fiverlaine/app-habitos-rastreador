
import React, { useState } from 'react';
import type { Habit, HabitType, HabitUnit, TimeOfDay } from '../types';
import { HABIT_ICONS, HABIT_COLORS, HABIT_UNITS, TIME_OF_DAY_OPTIONS } from '../constants';
import { getIconComponent, XIcon, ClockIcon, BellIcon } from './icons';
import TimePickerModal from './TimePickerModal';

interface AddHabitModalProps {
    onClose: () => void;
    onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, onAddHabit }) => {
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
    const [habitType, setHabitType] = useState<HabitType>('boolean');
    const [unit, setUnit] = useState<HabitUnit>('none');
    const [targetValue, setTargetValue] = useState<string>('1');
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
    const [scheduledTimes, setScheduledTimes] = useState<string[]>([]);
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 3) {
            setError('O nome do hábito deve ter pelo menos 3 caracteres.');
            return;
        }
        
        const habit: Omit<Habit, 'id' | 'createdAt'> = {
            name: name.trim(),
            icon: selectedIcon,
            color: selectedColor,
            type: habitType,
            timeOfDay,
            scheduledTimes,
            reminderEnabled,
        };
        
        if (habitType === 'numeric') {
            habit.unit = unit;
            habit.targetValue = parseFloat(targetValue) || 1;
        }
        
        onAddHabit(habit);
    };
    
    const IconComponent = getIconComponent(selectedIcon);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Novo Hábito</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6 text-center">
                       <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${selectedColor} mb-4`}>
                           <IconComponent className="w-12 h-12 text-white" />
                       </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="habit-name" className="block text-sm font-medium text-slate-300 mb-2">Nome do Hábito</label>
                        <input
                            id="habit-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Ex: Ler 1 capítulo"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                         {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Hábito</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setHabitType('boolean')}
                                className={`px-4 py-2 rounded-md transition-all ${
                                    habitType === 'boolean'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                Sim/Não
                            </button>
                            <button
                                type="button"
                                onClick={() => setHabitType('numeric')}
                                className={`px-4 py-2 rounded-md transition-all ${
                                    habitType === 'numeric'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                Numérico
                            </button>
                        </div>
                    </div>

                    {habitType === 'numeric' && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="habit-unit" className="block text-sm font-medium text-slate-300 mb-2">Unidade de Medida</label>
                                <select
                                    id="habit-unit"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value as HabitUnit)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {HABIT_UNITS.map((u) => (
                                        <option key={u.value} value={u.value}>
                                            {u.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="habit-target" className="block text-sm font-medium text-slate-300 mb-2">Meta Diária</label>
                                <input
                                    id="habit-target"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={targetValue}
                                    onChange={(e) => setTargetValue(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Período do Dia */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Período do Dia</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TIME_OF_DAY_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setTimeOfDay(option.value)}
                                    className={`px-3 py-3 rounded-lg transition-all text-left ${
                                        timeOfDay === option.value
                                            ? 'bg-teal-600 text-white border-2 border-teal-400'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-2 border-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{option.icon}</span>
                                        <div>
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-xs opacity-75">{option.description}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lembretes */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <BellIcon className="w-4 h-4 text-teal-400" />
                                Lembretes
                            </label>
                            <button
                                type="button"
                                onClick={() => setReminderEnabled(!reminderEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    reminderEnabled ? 'bg-teal-600' : 'bg-slate-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        
                        {reminderEnabled && (
                            <button
                                type="button"
                                onClick={() => setShowTimePicker(true)}
                                className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-4 py-3 text-white flex items-center justify-between transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-teal-400" />
                                    <span className="text-sm">
                                        {scheduledTimes.length > 0 
                                            ? `${scheduledTimes.length} horário${scheduledTimes.length > 1 ? 's' : ''} configurado${scheduledTimes.length > 1 ? 's' : ''}`
                                            : 'Definir horários'}
                                    </span>
                                </div>
                                <span className="text-slate-400 text-xs">
                                    {scheduledTimes.length > 0 && scheduledTimes.join(', ')}
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Ícone</label>
                        <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                            {HABIT_ICONS.map(icon => (
                                <button
                                    type="button"
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`flex justify-center items-center p-2 sm:p-3 rounded-lg transition-all duration-300 ease-out transform hover:scale-105 ${selectedIcon === icon ? 'bg-indigo-600 ring-2 ring-white scale-105' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    {React.createElement(getIconComponent(icon), { className: 'w-5 h-5 sm:w-6 sm:h-6 text-white' })}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Cor</label>
                        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                           {HABIT_COLORS.map(color => (
                                <button
                                    type="button"
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full ${color} transition-all duration-300 ease-out transform hover:scale-110 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white scale-110' : ''}`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500">
                        Criar Hábito
                    </button>
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

export default AddHabitModal;
