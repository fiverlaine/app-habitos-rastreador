
import React, { useMemo, useState } from 'react';
import type { Habit, Completion } from '../types';
import { calculateStreak } from '../utils/streak';
import { FireIcon, CheckIcon, TrashIcon, getIconComponent, XIcon, PlusIcon } from './icons';
import NumericAmountModal from './NumericAmountModal';

interface HabitItemProps {
    habit: Habit;
    isCompleted: boolean;
    currentValue?: number;
    completions: Completion[];
    onToggle: (habitId: string, value?: number) => void;
    onDelete: (habitId: string) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, isCompleted, currentValue, completions, onToggle, onDelete }) => {
    const [showNumericInput, setShowNumericInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { currentStreak } = useMemo(() => calculateStreak(completions.map(c => c.date)), [completions]);
    
    const IconComponent = getIconComponent(habit.icon);

    const handleNumericSubmit = () => {
        const value = parseFloat(inputValue);
        if (value > 0) {
            onToggle(habit.id, value);
            setInputValue('');
            setShowNumericInput(false);
        }
    };

    const progressPercentage = useMemo(() => {
        if (habit.type === 'numeric' && habit.targetValue && currentValue !== undefined) {
            return Math.min((currentValue / habit.targetValue) * 100, 100);
        }
        return 0;
    }, [habit, currentValue]);

    const [showModal, setShowModal] = useState(false);

    return (
        <div className={`rounded-2xl p-4 flex items-center justify-between transition-all duration-300 border ${isCompleted ? 'opacity-90 border-green-500/40' : 'border-slate-700'} ${habit.type === 'numeric' ? 'bg-slate-800/60' : 'bg-slate-800'}`}>
            <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${habit.color}`}>
                    <IconComponent className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-lg text-white">{habit.name}</p>
                    {habit.type === 'numeric' && (
                        <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${isCompleted ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                {currentValue || 0} / {habit.targetValue || 0} {habit.unit && habit.unit !== 'none' ? habit.unit : ''}{isCompleted ? ' • Concluído' : ''}
                            </span>
                            <div className="w-full bg-slate-700/80 rounded-full h-2 mt-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : habit.color}`}
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    {habit.type === 'boolean' && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <FireIcon className={`w-4 h-4 ${currentStreak > 0 ? 'text-orange-400' : 'text-slate-500'}`} />
                            <span>{currentStreak > 0 ? `${currentStreak} dia${currentStreak > 1 ? 's' : ''} de sequência` : 'Sem sequência'}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {habit.type === 'boolean' ? (
                    <button
                        onClick={() => onToggle(habit.id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            isCompleted ? 'bg-green-500' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        aria-label={isCompleted ? 'Desmarcar hábito' : 'Marcar hábito como concluído'}
                    >
                        <CheckIcon className="w-7 h-7 text-white" />
                    </button>
                ) : (
                    isCompleted ? (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500 text-white" title="Meta do dia concluída">
                            <CheckIcon className="w-7 h-7" />
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-500 hover:bg-teal-400 text-white"
                            aria-label="Adicionar valor"
                        >
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    )
                )}
                <button
                    onClick={() => onDelete(habit.id)}
                    className="text-slate-500 hover:text-red-500 transition-colors p-2"
                    aria-label="Deletar hábito"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            {habit.type === 'numeric' && (
                <NumericAmountModal
                    open={showModal}
                    unit={habit.unit}
                    onClose={() => setShowModal(false)}
                    onConfirm={(val) => onToggle(habit.id, val)}
                />
            )}
        </div>
    );
};

export default HabitItem;
