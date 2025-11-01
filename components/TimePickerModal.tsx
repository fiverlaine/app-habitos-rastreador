import React, { useState } from 'react';
import { XIcon, PlusIcon, TrashIcon, ClockIcon } from './icons';

interface TimePickerModalProps {
    open: boolean;
    scheduledTimes: string[];
    onClose: () => void;
    onConfirm: (times: string[]) => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({ open, scheduledTimes, onClose, onConfirm }) => {
    const [times, setTimes] = useState<string[]>(scheduledTimes.length > 0 ? [...scheduledTimes] : []);
    const [newTime, setNewTime] = useState('09:00');

    if (!open) return null;

    const handleAddTime = () => {
        if (newTime && !times.includes(newTime)) {
            const updatedTimes = [...times, newTime].sort();
            setTimes(updatedTimes);
        }
    };

    const handleRemoveTime = (timeToRemove: string) => {
        setTimes(times.filter(t => t !== timeToRemove));
    };

    const handleConfirm = () => {
        onConfirm(times);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-7 w-full max-w-md shadow-2xl border border-slate-800/50 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center border border-cyan-500/20">
                            <ClockIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Horários de Lembrete</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Adicione os horários em que deseja receber lembretes para este hábito.
                </p>

                {/* Lista de horários adicionados */}
                {times.length > 0 && (
                    <div className="mb-6 space-y-3">
                        {times.map((time) => (
                            <div
                                key={time}
                                className="flex items-center justify-between bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                        <ClockIcon className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <span className="text-white font-bold text-lg">{time}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveTime(time)}
                                    className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all duration-300 active:scale-90"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Adicionar novo horário */}
                <div className="mb-6">
                    <label htmlFor="new-time" className="block text-sm font-semibold text-slate-300 mb-2.5">
                        Adicionar Horário
                    </label>
                    <div className="flex gap-3">
                        <input
                            id="new-time"
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                        />
                        <button
                            onClick={handleAddTime}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-90 flex items-center justify-center"
                        >
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Horários sugeridos */}
                {times.length === 0 && (
                    <div className="mb-6">
                        <p className="text-sm text-slate-500 mb-3 font-semibold">Sugestões:</p>
                        <div className="grid grid-cols-4 gap-2.5">
                            {['07:00', '12:00', '19:00', '21:00'].map((suggestedTime) => (
                                <button
                                    key={suggestedTime}
                                    onClick={() => {
                                        setNewTime(suggestedTime);
                                        if (!times.includes(suggestedTime)) {
                                            setTimes([...times, suggestedTime].sort());
                                        }
                                    }}
                                    className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 hover:text-white rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95"
                                >
                                    {suggestedTime}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-95"
                    >
                        Confirmar
                    </button>
                </div>

                {times.length === 0 && (
                    <p className="text-center text-slate-500 text-xs mt-4">
                        Sem horários = sem lembretes
                    </p>
                )}
            </div>
        </div>
    );
};

export default TimePickerModal;

