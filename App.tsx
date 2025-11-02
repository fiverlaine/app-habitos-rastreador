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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 max-w-md border border-red-500/30 shadow-2xl shadow-red-500/10 animate-scale-in">
                    <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Erro de Configuração</h1>
                    <p className="text-slate-300 mb-6 text-sm leading-relaxed">{authError}</p>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-400 mb-3">Para corrigir, crie um arquivo <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">. env.local</code> na raiz do projeto:</p>
                        <pre className="text-xs text-emerald-400 bg-slate-950 p-3 rounded-lg overflow-x-auto">
{`VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJh...`}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    // Se não estiver autenticado, mostrar tela de login
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-bounce-soft">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-slate-200">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Auth onSignIn={signIn} onSignUp={signUp} />;
    }

    // Se há erro nos dados, mostrar tela de erro
    if (dataError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 max-w-md border border-red-500/30 shadow-2xl shadow-red-500/10 animate-scale-in">
                    <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Erro nos Dados</h1>
                    <p className="text-slate-300 mb-6 text-sm leading-relaxed">{dataError}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Recarregar Página
                    </button>
                </div>
            </div>
        );
    }

    // Se dados estão carregando, mostrar loading
    if (dataLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-sans text-slate-100 p-6">
                <div className="max-w-2xl mx-auto pb-16 pt-12">
                    <main className="mt-8 space-y-6 animate-fade-in">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-3 mb-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce-soft"></div>
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce-soft" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce-soft" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">Carregando seus hábitos</h2>
                            <p className="text-sm text-slate-400">Preparando tudo para você</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-sans text-slate-100">
            <div className="max-w-2xl mx-auto pb-16 px-5 pt-12">
                <main className="animate-fade-in">
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
                    className="fixed bottom-16 right-5 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl p-3 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 z-30 flex items-center gap-2 group active:scale-95"
                    title="Ativar Notificações"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold text-sm">
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