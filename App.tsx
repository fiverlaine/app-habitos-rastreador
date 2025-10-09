import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Habit, Completion, View, Achievement } from './types';
import { achievementsList } from './utils/achievements';
import { useAuth } from './hooks/useAuth';
import { useSupabaseData } from './hooks/useSupabaseData';
import Auth from './components/Auth';
import Header from './components/Header';
import HabitList from './components/HabitList';
import AddHabitModal from './components/AddHabitModal';
import Statistics from './components/Statistics';
import CalendarView from './components/CalendarView';
import GamificationWidget from './components/GamificationWidget';
import AchievementsView from './components/AchievementsView';
import AchievementToast from './components/AchievementToast';
import BottomNav from './components/BottomNav';
import WeekView from './components/WeekView';
import StatsCards from './components/StatsCards';
import AddTemplates from './components/AddTemplates';
import UserProfile from './components/UserProfile';
import DebugInfo from './components/DebugInfo';
import PWAInstaller from './components/PWAInstaller';
import { PlusIcon } from './components/icons';

const App: React.FC = () => {
    // SEMPRE chamar hooks na mesma ordem
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);
    
    // Autenticação
    const { user, loading: authLoading, error: authError, signIn, signUp, signOut } = useAuth();
    
    // Dados do Supabase (sempre chamado, mas pode retornar dados vazios se não há usuário)
    const {
        habits,
        completions,
        unlockedAchievements,
        loading: dataLoading,
        error: dataError,
        addHabit: addHabitToDb,
        deleteHabit: deleteHabitFromDb,
        toggleCompletion: toggleCompletionInDb,
        addAchievement: addAchievementToDb,
    } = useSupabaseData(user);

    // Sistema de conquistas - SEMPRE chamado, mas só executa se há usuário
    useEffect(() => {
        if (!user) return;

        const newlyUnlocked = achievementsList.filter(ach => 
            !unlockedAchievements.has(ach.id) && ach.evaluate(habits, completions)
        );

        if (newlyUnlocked.length > 0) {
            // Adicionar conquistas ao banco
            newlyUnlocked.forEach(ach => addAchievementToDb(ach.id));
            
            // Mostrar toast da primeira conquista
            if (!toastAchievement) {
                setToastAchievement(newlyUnlocked[0]);
                setTimeout(() => {
                    setToastAchievement(null);
                }, 5000);
            }
        }
    }, [habits, completions, unlockedAchievements, toastAchievement, user, addAchievementToDb]);

    // SEMPRE definir callbacks antes dos returns condicionais
    const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
        try {
            await addHabitToDb(habit);
            setIsModalOpen(false);
            setCurrentView('dashboard');
        } catch (error) {
            console.error('Erro ao adicionar hábito:', error);
            alert('Erro ao adicionar hábito. Tente novamente.');
        }
    };
    
    const deleteHabit = useCallback(async (habitId: string) => {
        if (window.confirm("Você tem certeza que quer deletar este hábito? Todo o progresso será perdido.")) {
            try {
                await deleteHabitFromDb(habitId);
            } catch (error) {
                console.error('Erro ao deletar hábito:', error);
                alert('Erro ao deletar hábito. Tente novamente.');
            }
        }
    }, [deleteHabitFromDb]);

    const toggleCompletion = useCallback(async (habitId: string, value?: number) => {
        try {
            await toggleCompletionInDb(habitId, value);
        } catch (error) {
            console.error('Erro ao toggle conclusão:', error);
            alert('Erro ao atualizar conclusão. Tente novamente.');
        }
    }, [toggleCompletionInDb]);

    // Se há erro de configuração, mostrar tela de erro
    if (authError) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-xl p-8 max-w-md border border-red-500">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">❌ Erro de Configuração</h1>
                    <p className="text-white mb-4">{authError}</p>
                    <div className="bg-slate-900 p-4 rounded-lg">
                        <p className="text-sm text-slate-300 mb-2">Para corrigir, crie um arquivo <code>.env.local</code> na raiz do projeto:</p>
                        <pre className="text-xs text-green-400 bg-black p-2 rounded">
{`VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    // Se não estiver autenticado, mostrar tela de login
    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-2xl">⏳ Carregando...</div>
            </div>
        );
    }

    if (!user) {
        return <Auth onSignIn={signIn} onSignUp={signUp} />;
    }

    // Se há erro nos dados, mostrar tela de erro
    if (dataError) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-xl p-8 max-w-md border border-red-500">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">❌ Erro nos Dados</h1>
                    <p className="text-white mb-4">{dataError}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        🔄 Recarregar Página
                    </button>
                </div>
            </div>
        );
    }

    // Se dados estão carregando, mostrar loading
    if (dataLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-white text-2xl mb-4">⏳ Carregando dados...</div>
                    <div className="text-slate-400">Aguarde um momento</div>
                </div>
            </div>
        );
    }

    const renderView = () => {
        switch (currentView) {
            case 'stats':
                return <Statistics habits={habits} completions={completions} />;
            case 'calendar':
                return <CalendarView habits={habits} completions={completions} />;
            case 'achievements':
                return <AchievementsView unlockedAchievementIds={unlockedAchievements} />;
            case 'add':
                return (
                    <AddTemplates 
                        onBack={() => setCurrentView('dashboard')}
                        onCreateFromTemplate={addHabit}
                        onCreateCustom={() => setIsModalOpen(true)}
                    />
                );
            case 'dashboard':
            default:
                return (
                    <>
                        <WeekView habits={habits} completions={completions} />
                        <StatsCards habits={habits} completions={completions} />
                        <HabitList habits={habits} completions={completions} onToggle={toggleCompletion} onDelete={deleteHabit} />
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto pb-24">
                {/* Header removido conforme solicitado */}
                <main className="mt-8">
                    {renderView()}
                </main>
            </div>

            {isModalOpen && (
                <AddHabitModal
                    onClose={() => setIsModalOpen(false)}
                    onAddHabit={addHabit}
                />
            )}
            
            <AchievementToast achievement={toastAchievement} onClose={() => setToastAchievement(null)} />
            <UserProfile user={user} onSignOut={signOut} />
            <PWAInstaller />
            <BottomNav 
                currentView={currentView} 
                setCurrentView={setCurrentView}
                onAddClick={() => setIsModalOpen(true)}
            />
        </div>
    );
};

export default App;