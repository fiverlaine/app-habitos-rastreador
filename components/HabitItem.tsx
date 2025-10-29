
import React, { useMemo, useState, useRef } from 'react';
import type { Habit, Completion } from '../types';
import { calculateStreak } from '../utils/streak';
import { FireIcon, CheckIcon, TrashIcon, getIconComponent, XIcon, PlusIcon } from './icons';
import NumericAmountModal from './NumericAmountModal';

import EditHabitModal from './EditHabitModal';

interface HabitItemProps {
    habit: Habit;
    isCompleted: boolean;
    currentValue?: number;
    completions: Completion[];
    onToggle: (habitId: string, value?: number) => void;
    onDelete: (habitId: string) => void;
    onUpdate: (habitId: string, updates: Partial<Habit>) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, isCompleted, currentValue, completions, onToggle, onDelete, onUpdate }) => {
    const [showNumericInput, setShowNumericInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const { currentStreak } = useMemo(() => calculateStreak(completions.map(c => c.date)), [completions]);
    
    const IconComponent = getIconComponent(habit.icon);

    // Swipe to delete
    const [translateX, setTranslateX] = useState(0);
    const [isSwipeOpen, setIsSwipeOpen] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchCurrentX = useRef<number>(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchCurrentX.current = translateX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = e.touches[0].clientX - touchStartX.current;
        const newTranslateX = touchCurrentX.current + diff;
        
        // Permitir deslize para a esquerda (swipe left) - translateX negativo
        if (newTranslateX >= -100 && newTranslateX <= 0) {
            setTranslateX(newTranslateX);
        }
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null) return;
        
        // Se deslizou mais de 50px para a esquerda, abre a lixeira
        if (translateX < -50) {
            setTranslateX(-100);
            setIsSwipeOpen(true);
        } else {
            setTranslateX(0);
            setIsSwipeOpen(false);
        }
        
        touchStartX.current = null;
    };

    const closeSwipe = () => {
        setTranslateX(0);
        setIsSwipeOpen(false);
    };

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
        <div className="relative overflow-hidden rounded-2xl">
            {/* Botão de deletar (aparece ao fazer swipe para esquerda) */}
            <div 
                className={`absolute right-0 top-0 bottom-0 flex items-center justify-end pr-4 pl-2 transition-all duration-300 ease-out ${
                    isSwipeOpen ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ 
                    width: '100px',
                    transform: isSwipeOpen ? 'translateX(0)' : 'translateX(100px)'
                }}
            >
                <button
                    onClick={() => {
                        onDelete(habit.id);
                        closeSwipe();
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all duration-300 ease-out transform active:scale-95 shadow-lg"
                    aria-label="Deletar hábito"
                >
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Card principal */}
            <div 
                className={`rounded-2xl p-4 flex items-center justify-between border ${isCompleted ? 'opacity-90 border-green-500/40 bg-green-500/5' : 'border-slate-700'} ${habit.type === 'numeric' ? 'bg-slate-800/60' : 'bg-slate-800'}`}
                style={{ 
                    transform: `translateX(${translateX}px)`,
                    transition: touchStartX.current ? 'none' : 'transform 300ms ease-out'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex items-center gap-4 flex-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                            closeSwipe();
                        }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${habit.color} hover:opacity-80 transition-opacity`}
                    >
                        <IconComponent className="w-7 h-7 text-white" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                            closeSwipe();
                        }}
                        className="flex-1 text-left"
                    >
                        <p className="font-semibold text-lg text-white hover:text-teal-400 transition-colors">{habit.name}</p>
                        {habit.type === 'numeric' && (
                            <div className="mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${isCompleted ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                    {currentValue || 0} / {habit.targetValue || 0} {habit.unit && habit.unit !== 'none' ? habit.unit : ''}{isCompleted ? ' • Concluído' : ''}
                                </span>
                                <div className="w-full bg-slate-700/80 rounded-full h-2 mt-2 overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-green-500 shadow-sm shadow-green-500/50' : habit.color}`}
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        {progressPercentage > 0 && (
                                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {habit.type === 'boolean' && (
                            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                <FireIcon className={`w-4 h-4 ${currentStreak > 0 ? 'text-orange-400' : 'text-slate-500'}`} />
                                <span>{currentStreak > 0 ? `${currentStreak} dia${currentStreak > 1 ? 's' : ''} de sequência` : 'Sem sequência'}</span>
                            </div>
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {habit.type === 'boolean' ? (
                        <button
                            onClick={() => {
                                onToggle(habit.id);
                                closeSwipe();
                            }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-out transform hover:scale-110 ${
                                isCompleted 
                                    ? 'bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/25' 
                                    : 'bg-slate-700 hover:bg-slate-600 hover:shadow-lg hover:shadow-slate-500/25'
                            }`}
                            aria-label={isCompleted ? 'Desmarcar hábito' : 'Marcar hábito como concluído'}
                        >
                            <CheckIcon className={`w-7 h-7 text-white transition-transform duration-300 ${isCompleted ? 'scale-110' : 'scale-100'}`} />
                        </button>
                    ) : (
                        isCompleted ? (
                            <button
                                onClick={() => {
                                    onToggle(habit.id);
                                    closeSwipe();
                                }}
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/25 transition-all duration-300 ease-out transform hover:scale-110"
                                title="Desmarcar hábito"
                                aria-label="Desmarcar hábito"
                            >
                                <CheckIcon className="w-7 h-7" />
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setShowModal(true);
                                    closeSwipe();
                                }}
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-500 hover:bg-teal-400 text-white transition-all duration-300 ease-out transform hover:scale-110 hover:shadow-lg hover:shadow-teal-500/25"
                                aria-label="Adicionar valor"
                            >
                                <PlusIcon className="w-6 h-6 transition-transform duration-300" />
                            </button>
                        )
                    )}
                </div>
            </div>
            
            {/* Fechar swipe quando clicar em qualquer ação */}
            {isSwipeOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={closeSwipe}
                    style={{ 
                        top: 'auto',
                        height: '100px',
                        pointerEvents: 'auto'
                    }}
                />
            )}

            {/* Modal numérico */}
            {habit.type === 'numeric' && (
                <NumericAmountModal
                    open={showModal}
                    unit={habit.unit}
                    onClose={() => setShowModal(false)}
                    onConfirm={(val) => onToggle(habit.id, val)}
                />
            )}

            {/* Modal de edição */}
            {showEditModal && (
                <EditHabitModal
                    habit={habit}
                    onClose={() => setShowEditModal(false)}
                    onSave={(habitId, updates) => {
                        onUpdate(habitId, updates);
                        setShowEditModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default HabitItem;
