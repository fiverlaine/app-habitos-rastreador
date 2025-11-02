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
        <nav className="fixed bottom-0 left-0 right-0 z-40">
            <div className="max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50">
                <div className="flex justify-around items-center px-1 py-2">
                    {navItems.map(({ view, label, icon: Icon, isAddButton }, index) => {
                        if (isAddButton) {
                            return (
                                <button
                                    key={index}
                                    onClick={() => setCurrentView(view)}
                                    className="flex flex-col items-center justify-center -mt-6 transition-all duration-300 active:scale-90"
                                >
                                    <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 rounded-2xl p-2.5 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 mb-0.5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <Icon className="w-4 h-4 text-white relative z-10" />
                                    </div>
                                    <span className="text-[9px] font-semibold text-slate-400 tracking-wide">{label}</span>
                                </button>
                            );
                        }

                        const isActive = currentView === view;
                        return (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view)}
                                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 transition-all duration-300 relative ${
                                    isActive ? '' : 'hover:bg-slate-800/50 rounded-xl'
                                }`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <div className={`relative transition-all duration-300 ${isActive ? 'scale-105' : 'scale-100'}`}>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg blur-md"></div>
                                    )}
                                    <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                                </div>
                                <span className={`text-[9px] font-semibold transition-all duration-300 tracking-wide ${
                                    isActive ? 'text-cyan-400' : 'text-slate-500'
                                }`}>
                                    {label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
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
