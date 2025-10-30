import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Habit, Completion, View, Achievement } from './types';
import { achievementsList } from './utils/achievements';
import { useAuth } from './hooks/useAuth';
import { useSupabaseData } from './hooks/useSupabaseData';
import { useNotifications } from './hooks/useNotifications';
import Auth from './components/Auth';
import HabitList from './components/HabitList';
import AddHabitModal from './components/AddHabitModal';
import Statistics from './components/Statistics';
import CalendarView from './components/CalendarView';
import AchievementsView from './components/AchievementsView';
import AchievementToast from './components/AchievementToast';
import BottomNav from './components/BottomNav';
import WeekView from './components/WeekView';
import StatsCards from './components/StatsCards';
import AddTemplates from './components/AddTemplates';
import UserProfile from './components/UserProfile';
import PWAInstaller from './components/PWAInstaller';
import SkeletonLoader from './components/SkeletonLoader';
import Toast from './components/Toast';
import NotificationSettings from './components/NotificationSettings';

const App: React.FC = () => {
    // SEMPRE chamar hooks na mesma ordem
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; visible: boolean }>({
        message: '',
        type: 'info',
        visible: false
    });
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    
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
        updateHabit: updateHabitInDb,
        toggleCompletion: toggleCompletionInDb,
        addAchievement: addAchievementToDb,
    } = useSupabaseData(user);

    // Sistema de notificações
    const {
        permission,
        isSupported,
        isSubscribed,
        scheduleAllNotifications,
        sendStreakReminderNotification,
        requestPermission,
        sendTestNotification,
    } = useNotifications(user);

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

    // Agendar notificações quando os hábitos mudarem
    useEffect(() => {
        if (!user || !isSupported || permission !== 'granted' || !isSubscribed) return;
        
        // Agendar notificações para todos os hábitos com lembretes ativos
        scheduleAllNotifications(habits);
    }, [habits, user, isSupported, permission, isSubscribed, scheduleAllNotifications]);

    // SEMPRE definir callbacks antes dos returns condicionais
    const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
        try {
            await addHabitToDb(habit);
            setIsModalOpen(false);
            setCurrentView('dashboard');
        } catch (error) {
            console.error('Erro ao adicionar hábito:', error);
            setToast({ message: 'Erro ao adicionar hábito. Tente novamente.', type: 'error', visible: true });
        }
    };
    
    const deleteHabit = useCallback(async (habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (window.confirm("Você tem certeza que quer deletar este hábito? Todo o progresso será perdido.")) {
            try {
                await deleteHabitFromDb(habitId);
            } catch (error) {
                console.error('Erro ao deletar hábito:', error);
                setToast({ message: 'Erro ao deletar hábito. Tente novamente.', type: 'error', visible: true });
            }
        }
    }, [deleteHabitFromDb, habits]);

    const toggleCompletion = useCallback(async (habitId: string, value?: number) => {
        try {
            await toggleCompletionInDb(habitId, value);
        } catch (error) {
            console.error('Erro ao toggle conclusão:', error);
            setToast({ message: 'Erro ao atualizar conclusão. Tente novamente.', type: 'error', visible: true });
        }
    }, [toggleCompletionInDb]);

    const updateHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
        try {
            await updateHabitInDb(habitId, updates);
        } catch (error) {
            console.error('Erro ao atualizar hábito:', error);
            setToast({ message: 'Erro ao atualizar hábito. Tente novamente.', type: 'error', visible: true });
        }
    }, [updateHabitInDb]);

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
            <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto pb-24">
                    <main className="mt-8 space-y-6">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 text-teal-400 mb-2">
                                <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-lg font-medium">Carregando seus hábitos...</span>
                            </div>
                            <p className="text-slate-400">Preparando tudo para você</p>
                        </div>
                        
                        <SkeletonLoader variant="habit" count={3} />
                        <SkeletonLoader variant="stats" />
                    </main>
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
                        <HabitList habits={habits} completions={completions} onToggle={toggleCompletion} onDelete={deleteHabit} onUpdate={updateHabit} />
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
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />
            
            {showNotificationSettings && (
                <NotificationSettings 
                    onClose={() => setShowNotificationSettings(false)}
                    permission={permission}
                    isSupported={isSupported}
                    isSubscribed={isSubscribed}
                    requestPermission={requestPermission}
                    sendTestNotification={sendTestNotification}
                />
            )}

            {/* Botão flutuante de notificações */}
            {isSupported && permission !== 'granted' && (
                <button
                    onClick={() => setShowNotificationSettings(true)}
                    className="fixed bottom-24 right-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-30 flex items-center gap-2 group"
                    title="Ativar Notificações"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">
                        Ativar Lembretes
                    </span>
                </button>
            )}

            <UserProfile user={user} onSignOut={signOut} onOpenNotifications={() => setShowNotificationSettings(true)} />
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