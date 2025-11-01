import React from 'react';
import type { View } from '../types';
import { ChartBarIcon, CalendarIcon, HomeIcon, TrophyIcon, PlusIcon } from './icons';

interface BottomNavProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    onAddClick?: () => void;
}

const navItems = [
    { view: 'dashboard' as View, label: 'Início', icon: HomeIcon },
    { view: 'stats' as View, label: 'Visão Geral', icon: ChartBarIcon },
    { view: 'add' as View, label: 'Adicionar', icon: PlusIcon, isAddButton: true },
    { view: 'calendar' as View, label: 'Rendimento', icon: CalendarIcon },
    { view: 'achievements' as View, label: 'Ajustes', icon: TrophyIcon },
] as const;

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, onAddClick }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-5 pt-2">
            <div className="max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-2xl shadow-black/40">
                <div className="flex justify-around items-center px-2 py-3">
                    {navItems.map(({ view, label, icon: Icon, isAddButton }, index) => {
                        if (isAddButton) {
                            return (
                                <button
                                    key={index}
                                    onClick={() => setCurrentView(view)}
                                    className="flex flex-col items-center justify-center -mt-9 transition-all duration-300 active:scale-90"
                                >
                                    <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 rounded-[22px] p-4 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 mb-1.5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <Icon className="w-6 h-6 text-white relative z-10" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400 tracking-wide">{label}</span>
                                </button>
                            );
                        }

                        const isActive = currentView === view;
                        return (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view)}
                                className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2 transition-all duration-300 relative ${
                                    isActive ? '' : 'hover:bg-slate-800/50 rounded-2xl'
                                }`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl blur-xl"></div>
                                    )}
                                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                                </div>
                                <span className={`text-[10px] font-semibold transition-all duration-300 tracking-wide ${
                                    isActive ? 'text-cyan-400' : 'text-slate-500'
                                }`}>
                                    {label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;
