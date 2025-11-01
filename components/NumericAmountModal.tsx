import React, { useMemo, useState } from 'react';
import type { HabitUnit } from '../types';
import { XIcon } from './icons';

interface NumericAmountModalProps {
    open: boolean;
    unit?: HabitUnit;
    onClose: () => void;
    onConfirm: (value: number) => void; // valor convertido para a unidade base do hábito
}

const timeOptions = ['seg', 'min', 'hr'] as const;
const volumeOptions = ['ml', 'litros'] as const;
const distanceOptions = ['metros', 'km'] as const;
const massOptions = ['gramas', 'kg'] as const;

type TimeOpt = typeof timeOptions[number];
type VolumeOpt = typeof volumeOptions[number];
type DistanceOpt = typeof distanceOptions[number];
type MassOpt = typeof massOptions[number];

const NumericAmountModal: React.FC<NumericAmountModalProps> = ({ open, unit = 'vezes', onClose, onConfirm }) => {
    const [amount, setAmount] = useState<string>('0');

    const { options, active, setActive, toBaseLabel } = useUnitController(unit);

    if (!open) return null;

    const handleConfirm = () => {
        const raw = parseFloat(amount.replace(',', '.')) || 0;
        const valueInBase = convertToBaseUnit(raw, unit, active);
        if (valueInBase > 0) onConfirm(valueInBase);
        onClose();
        setAmount('0');
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-5 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md p-6 border border-slate-800/50 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="text-slate-400 text-sm font-semibold">Insira o valor</div>
                    <button 
                        className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90" 
                        onClick={onClose}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className="text-5xl font-extrabold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                        {Number.isNaN(parseFloat(amount)) ? '0' : amount}
                        <span className="text-2xl text-slate-400 ml-2 font-semibold">{toBaseLabel(active)}</span>
                    </div>
                </div>

                {options.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setActive(opt)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    active === opt 
                                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30' 
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 active:scale-95'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mb-6">
                    <input
                        autoFocus
                        inputMode="decimal"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                        className="w-full text-center text-4xl font-bold bg-slate-800/50 text-white rounded-2xl py-4 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                    />
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-95"
                >
                    Confirmar
                </button>
            </div>
        </div>
    );
};

export default NumericAmountModal;

// --- Helpers ---
function useUnitController(unit: HabitUnit | undefined) {
    const [active, setActiveInternal] = useState<string>(() => getDefaultOpt(unit));
    const options = useMemo(() => getOptions(unit), [unit]);
    const setActive = (v: string) => setActiveInternal(v);
    const toBaseLabel = (v: string) => getLabelFor(v);
    return { options, active, setActive, toBaseLabel } as const;
}

function getOptions(unit?: HabitUnit): string[] {
    switch (unit) {
        case 'minutos':
        case 'horas':
            return [...timeOptions];
        case 'litros':
        case 'ml':
            return [...volumeOptions];
        case 'km':
        case 'metros':
            return [...distanceOptions];
        case 'gramas':
        case 'kg':
            return [...massOptions];
        default:
            return [];
    }
}

function getDefaultOpt(unit?: HabitUnit): string {
    switch (unit) {
        case 'minutos':
            return 'min';
        case 'horas':
            return 'hr';
        case 'litros':
            return 'litros';
        case 'ml':
            return 'ml';
        case 'km':
            return 'km';
        case 'metros':
            return 'metros';
        case 'kg':
            return 'kg';
        case 'gramas':
            return 'gramas';
        default:
            return '';
    }
}

function getLabelFor(opt: string) {
    return opt;
}

// Converte o valor digitado (na unidade do "opt" selecionado) para a unidade base do hábito
function convertToBaseUnit(value: number, base: HabitUnit | undefined, opt: string): number {
    if (!base) return value;
    switch (base) {
        case 'litros':
            return opt === 'ml' ? value / 1000 : value;
        case 'ml':
            return opt === 'litros' ? value * 1000 : value;
        case 'minutos':
            if (opt === 'seg') return value / 60;
            if (opt === 'hr') return value * 60;
            return value;
        case 'horas':
            if (opt === 'seg') return value / 3600;
            if (opt === 'min') return value / 60;
            return value;
        case 'km':
            return opt === 'metros' ? value / 1000 : value;
        case 'metros':
            return opt === 'km' ? value * 1000 : value;
        case 'kg':
            return opt === 'gramas' ? value / 1000 : value;
        case 'gramas':
            return opt === 'kg' ? value * 1000 : value;
        default:
            return value;
    }
}


