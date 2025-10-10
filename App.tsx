import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Habit, Completion, View, Achievement } from './types';
import { achievementsList } from './utils/achievements';
import { useAuth } from './hooks/useAuth';
import { useHybridData } from './hooks/useHybridData';
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
import SkeletonLoader from './components/SkeletonLoader';
import Toast from './components/Toast';
import OfflineStatus from './components/OfflineStatus';
import OfflineFallback from './components/OfflineFallback';
import DebugPanel from './components/DebugPanel';
import DiagnosticScreen from './components/DiagnosticScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { PlusIcon } from './components/icons';

const App: React.FC = () => {
    try {
        // SEMPRE chamar hooks na mesma ordem
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentView, setCurrentView] = useState<View>('dashboard');
        const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);
        const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; visible: boolean }>({
            message: '',
            type: 'info',
            visible: false
        });
        const [showDebug, setShowDebug] = useState(false);
        const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
    
    // Debug: Log inicial
    console.log('🚀 App iniciando...');
    
    // Autenticação
    const { user, loading: authLoading, error: authError, signIn, signUp, signOut } = useAuth();
    
    // Debug: Log de autenticação
    console.log('🔐 Auth state:', { user: !!user, loading: authLoading, error: authError });
    
    // Dados híbridos (online + offline) - só chama se há usuário
    const hybridData = useHybridData(user);
    const {
        habits = [],
        completions = [],
        unlockedAchievements = new Set(),
        loading: dataLoading = false,
        error: dataError = null,
        isOnline = navigator.onLine,
        addHabit: addHabitToDb,
        deleteHabit: deleteHabitFromDb,
        toggleCompletion: toggleCompletionInDb,
        addAchievement: addAchievementToDb,
        syncOfflineData,
    } = hybridData || {};
    
    // Debug: Log de dados híbridos
    console.log('📊 Hybrid data state:', { 
        habitsCount: habits.length, 
        loading: dataLoading, 
        error: dataError, 
        isOnline 
    });

    // Verificar Service Worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                setServiceWorkerReady(true);
                console.log('✅ Service Worker pronto');
            });
        }
    }, []);

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
            setToast({ message: `Hábito "${habit.name}" criado com sucesso! 🎉`, type: 'success', visible: true });
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
                setToast({ message: `Hábito "${habit?.name}" removido com sucesso!`, type: 'success', visible: true });
            } catch (error) {
                console.error('Erro ao deletar hábito:', error);
                setToast({ message: 'Erro ao deletar hábito. Tente novamente.', type: 'error', visible: true });
            }
        }
    }, [deleteHabitFromDb, habits]);

    const toggleCompletion = useCallback(async (habitId: string, value?: number) => {
        const habit = habits.find(h => h.id === habitId);
        try {
            await toggleCompletionInDb(habitId, value);
            const todayStr = new Date().toISOString().split('T')[0];
            const todayCompletions = completions.filter(c => c.habitId === habitId && c.date === todayStr);
            const isCompleted = habit?.type === 'boolean' 
                ? todayCompletions.length > 0
                : habit?.targetValue ? (todayCompletions.reduce((sum, c) => sum + (c.value || 0), 0) >= habit.targetValue) : false;
            
            if (isCompleted) {
                setToast({ message: `Parabéns! "${habit?.name}" concluído! 🎉`, type: 'success', visible: true });
            } else {
                setToast({ message: `Progresso atualizado em "${habit?.name}"!`, type: 'info', visible: true });
            }
        } catch (error) {
            console.error('Erro ao toggle conclusão:', error);
            setToast({ message: 'Erro ao atualizar conclusão. Tente novamente.', type: 'error', visible: true });
        }
    }, [toggleCompletionInDb, habits, completions]);

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
        console.log('⏳ Auth loading...');
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-2xl">⏳ Carregando...</div>
            </div>
        );
    }

    if (!user) {
        console.log('👤 Sem usuário - mostrando tela de login');
        return <Auth onSignIn={signIn} onSignUp={signUp} />;
    }

    // Se há erro nos dados, mostrar tela de erro
    if (dataError) {
        console.log('❌ Erro nos dados:', dataError);
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
        console.log('⏳ Dados carregando...', { isOnline });
        return (
            <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto pb-24">
                    <main className="mt-8 space-y-6">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 text-teal-400 mb-2">
                                <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-lg font-medium">Carregando seus hábitos...</span>
                            </div>
                            <p className="text-slate-400">
                                {isOnline ? 'Sincronizando dados...' : 'Carregando dados offline...'}
                            </p>
                        </div>
                        
                        <SkeletonLoader variant="habit" count={3} />
                        <SkeletonLoader variant="stats" />
                    </main>
                </div>
            </div>
        );
    }

    // Se está offline e não há dados, mostrar diagnóstico
    if (!isOnline && !user && habits.length === 0) {
        console.log('📴 Offline sem dados - mostrando diagnóstico');
        return (
            <DiagnosticScreen 
                isOnline={isOnline} 
                onRetry={() => window.location.reload()} 
            />
        );
    }

    // Debug: Log final antes da renderização
    console.log('🎯 Renderizando app principal:', { 
        user: !!user, 
        habitsCount: habits.length, 
        isOnline, 
        currentView 
    });

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
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />
            <OfflineStatus isOnline={isOnline} />
            <UserProfile user={user} onSignOut={signOut} />
            <PWAInstaller />
            <BottomNav 
                currentView={currentView} 
                setCurrentView={setCurrentView}
                onAddClick={() => setIsModalOpen(true)}
            />
            
            {/* Debug Panel */}
            <DebugPanel
                debugInfo={{
                    authLoading,
                    authError,
                    user: !!user,
                    dataLoading,
                    dataError,
                    isOnline,
                    habitsCount: habits.length,
                    currentView,
                    serviceWorkerReady
                }}
                isVisible={showDebug}
                onToggle={() => setShowDebug(!showDebug)}
            />
        </div>
    );
    } catch (error) {
        console.error('🚨 Erro crítico no App:', error);
        return (
            <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4">
                <div className="max-w-md mx-auto mt-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 text-red-400 mb-4">
                            <div className="w-12 h-12 text-4xl">🚨</div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Erro Crítico
                        </h1>
                        <p className="text-slate-400">
                            O app encontrou um erro inesperado.
                        </p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-red-500/50">
                        <h2 className="text-lg font-bold text-white mb-4">🔧 Detalhes do Erro</h2>
                        <div className="text-sm text-red-300 break-all">
                            {error instanceof Error ? error.message : 'Erro desconhecido'}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-teal-500 hover:bg-teal-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            🔄 Recarregar Página
                        </button>
                        
                        <button
                            onClick={() => {
                                localStorage.clear();
                                if ('indexedDB' in window) {
                                    indexedDB.deleteDatabase('habitos-offline-db');
                                }
                                window.location.reload();
                            }}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            🗑️ Limpar Dados e Recarregar
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};

export default App;