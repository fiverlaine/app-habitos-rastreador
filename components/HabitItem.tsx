
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
        <div className="relative overflow-hidden rounded-3xl group">
            {/* Botão de deletar (aparece ao fazer swipe para esquerda) */}
            <div 
                className={`absolute right-0 top-0 bottom-0 flex items-center justify-end pr-5 pl-2 transition-all duration-300 ease-out ${
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
                    className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white transition-all duration-300 ease-out transform active:scale-90 shadow-2xl shadow-red-500/40"
                    aria-label="Deletar hábito"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Card principal */}
            <div 
                className={`relative rounded-3xl p-5 flex items-center justify-between border backdrop-blur-sm transition-all duration-300 ${
                    isCompleted 
                        ? 'bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                        : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700/70'
                }`}
                style={{ 
                    transform: `translateX(${translateX}px)`,
                    transition: touchStartX.current ? 'none' : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Brilho de fundo para item completo */}
                {isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent rounded-3xl"></div>
                )}
                
                <div className="flex items-center gap-4 flex-1 relative z-10">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                            closeSwipe();
                        }}
                        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center ${habit.color} hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg overflow-hidden group/icon`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"></div>
                        <IconComponent className="w-6 h-6 text-white relative z-10" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                            closeSwipe();
                        }}
                        className="flex-1 text-left min-w-0"
                    >
                        <p className="font-bold text-base text-white hover:text-cyan-400 transition-colors truncate">{habit.name}</p>
                        {habit.type === 'numeric' && (
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`font-semibold ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {currentValue || 0} / {habit.targetValue || 0} {habit.unit && habit.unit !== 'none' ? habit.unit : ''}
                                    </span>
                                    {isCompleted && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                            Concluído
                                        </span>
                                    )}
                                </div>
                                <div className="relative w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                                            isCompleted 
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                                : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                                        }`}
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        {progressPercentage > 0 && (
                                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {habit.type === 'boolean' && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                                    currentStreak > 0 ? 'bg-orange-500/20' : 'bg-slate-800'
                                }`}>
                                    <FireIcon className={`w-3 h-3 ${currentStreak > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
                                </div>
                                <span className="font-medium">
                                    {currentStreak > 0 ? `${currentStreak} dia${currentStreak > 1 ? 's' : ''} de sequência` : 'Sem sequência'}
                                </span>
                            </div>
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                    {habit.type === 'boolean' ? (
                        <button
                            onClick={() => {
                                onToggle(habit.id);
                                closeSwipe();
                            }}
                            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out active:scale-90 overflow-hidden group/check ${
                                isCompleted 
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30' 
                                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700/50'
                            }`}
                            aria-label={isCompleted ? 'Desmarcar hábito' : 'Marcar hábito como concluído'}
                        >
                            {isCompleted && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/check:opacity-100 transition-opacity duration-300"></div>
                            )}
                            <CheckIcon className={`w-6 h-6 text-white transition-all duration-300 relative z-10 ${
                                isCompleted ? 'scale-100' : 'scale-0 opacity-0'
                            }`} />
                        </button>
                    ) : (
                        isCompleted ? (
                            <button
                                onClick={() => {
                                    onToggle(habit.id);
                                    closeSwipe();
                                }}
                                className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30 transition-all duration-300 ease-out active:scale-90 overflow-hidden group/check"
                                title="Desmarcar hábito"
                                aria-label="Desmarcar hábito"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/check:opacity-100 transition-opacity duration-300"></div>
                                <CheckIcon className="w-6 h-6 text-white relative z-10" />
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setShowModal(true);
                                    closeSwipe();
                                }}
                                className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 ease-out active:scale-90 overflow-hidden group/add"
                                aria-label="Adicionar valor"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/add:opacity-100 transition-opacity duration-300"></div>
                                <PlusIcon className="w-6 h-6 relative z-10" />
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
