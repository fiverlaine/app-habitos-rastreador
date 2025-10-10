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
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-40">
            <div className="max-w-4xl mx-auto flex justify-around items-center">
                {navItems.map(({ view, label, icon: Icon, isAddButton }, index) => {
                    if (isAddButton) {
                        return (
                            <button
                                key={index}
                                onClick={() => setCurrentView(view)}
                                className="flex flex-col items-center justify-center -mt-6 transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
                            >
                                <div className="bg-teal-500 hover:bg-teal-400 rounded-full p-4 shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:shadow-teal-500/25">
                                    <Icon className="w-6 h-6 text-white transition-transform duration-300" />
                                </div>
                                <span className="text-xs font-medium text-slate-400 mt-1 transition-colors duration-300">{label}</span>
                            </button>
                        );
                    }

                    const isActive = currentView === view;
                    return (
                        <button
                            key={view}
                            onClick={() => setCurrentView(view)}
                            className={`flex flex-col items-center justify-center gap-1 w-full py-2 transition-all duration-300 ease-out relative ${
                                isActive ? 'text-teal-400' : 'text-slate-400 hover:text-white'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <div className={`transition-all duration-300 ease-out ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-medium transition-all duration-300 ${isActive ? 'text-teal-400 font-semibold' : 'text-slate-400'}`}>{label}</span>
                            {isActive && (
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full animate-pulse"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
