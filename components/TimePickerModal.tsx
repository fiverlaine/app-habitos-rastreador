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
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-6 h-6 text-teal-400" />
                        <h2 className="text-2xl font-bold text-white">Horários de Lembrete</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <p className="text-slate-400 text-sm mb-4">
                    Adicione os horários em que deseja receber lembretes para este hábito.
                </p>

                {/* Lista de horários adicionados */}
                {times.length > 0 && (
                    <div className="mb-4 space-y-2">
                        {times.map((time) => (
                            <div
                                key={time}
                                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                            >
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-teal-400" />
                                    <span className="text-white font-medium text-lg">{time}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveTime(time)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-500/10"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Adicionar novo horário */}
                <div className="mb-6">
                    <label htmlFor="new-time" className="block text-sm font-medium text-slate-300 mb-2">
                        Adicionar Horário
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="new-time"
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={handleAddTime}
                            className="bg-teal-500 hover:bg-teal-400 text-white rounded-lg px-4 py-3 transition-colors flex items-center gap-2 font-medium"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Horários sugeridos */}
                {times.length === 0 && (
                    <div className="mb-6">
                        <p className="text-sm text-slate-400 mb-2">Sugestões:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {['07:00', '12:00', '19:00', '21:00'].map((suggestedTime) => (
                                <button
                                    key={suggestedTime}
                                    onClick={() => {
                                        setNewTime(suggestedTime);
                                        if (!times.includes(suggestedTime)) {
                                            setTimes([...times, suggestedTime].sort());
                                        }
                                    }}
                                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg px-3 py-2 text-sm transition-colors"
                                >
                                    {suggestedTime}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        Confirmar
                    </button>
                </div>

                {times.length === 0 && (
                    <p className="text-center text-slate-500 text-xs mt-3">
                        💡 Sem horários = sem lembretes
                    </p>
                )}
            </div>
        </div>
    );
};

export default TimePickerModal;

