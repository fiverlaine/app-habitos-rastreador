import { useState, useEffect, useCallback } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { OfflineStorage, type PendingOperation } from '../utils/offlineStorage';
import type { Habit, Completion } from '../types';
import type { User } from '@supabase/supabase-js';

export interface HybridDataResult {
  habits: Habit[];
  completions: Completion[];
  unlockedAchievements: Set<string>;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<Habit>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleCompletion: (habitId: string, value?: number) => Promise<void>;
  addAchievement: (achievementId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
}

export const useHybridData = (user: User | null): HybridDataResult => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState({
    habits: [] as Habit[],
    completions: [] as Completion[],
    unlockedAchievements: new Set<string>()
  });
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineError, setOfflineError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Tratamento de erro para useSupabaseData
  let supabaseData;
  try {
    supabaseData = useSupabaseData(user);
  } catch (error) {
    console.error('❌ Erro no useSupabaseData:', error);
    supabaseData = {
      habits: [],
      completions: [],
      unlockedAchievements: new Set(),
      loading: false,
      error: 'Erro ao carregar dados do Supabase',
      addHabit: async () => { throw new Error('Supabase não disponível'); },
      deleteHabit: async () => { throw new Error('Supabase não disponível'); },
      toggleCompletion: async () => { throw new Error('Supabase não disponível'); },
      addAchievement: async () => { throw new Error('Supabase não disponível'); },
      refreshData: async () => {}
    };
  }

  // Tratamento de erro para OfflineStorage
  let offlineStorage;
  try {
    offlineStorage = OfflineStorage.getInstance();
  } catch (error) {
    console.error('❌ Erro ao inicializar OfflineStorage:', error);
    setOfflineError('Erro ao inicializar armazenamento offline');
  }

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexão restaurada');
      setIsOnline(true);
      // Sincronizar dados quando voltar online
      syncOfflineData();
    };
    
    const handleOffline = () => {
      console.log('📴 Conexão perdida - Modo offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar dados offline quando necessário
  useEffect(() => {
    if (!isOnline && user) {
      loadOfflineData();
    }
  }, [isOnline, user]);

  // Carregar operações pendentes
  useEffect(() => {
    if (user) {
      loadPendingOperations();
    }
  }, [user]);

  const loadOfflineData = async () => {
    if (!user) {
      console.log('⚠️ Sem usuário - não carregando dados offline');
      setIsInitialized(true);
      return;
    }
    
    if (!offlineStorage) {
      console.error('❌ OfflineStorage não disponível');
      setOfflineError('Armazenamento offline não disponível');
      setIsInitialized(true);
      return;
    }
    
    try {
      setOfflineError(null);
      const data = await offlineStorage.getAllOfflineData(user.id);
      setOfflineData({
        habits: data.habits,
        completions: data.completions,
        unlockedAchievements: new Set(data.achievements.map(a => a.achievement_id))
      });
      console.log('📱 Dados offline carregados:', data.habits.length, 'hábitos');
    } catch (error) {
      console.error('❌ Erro ao carregar dados offline:', error);
      setOfflineError('Erro ao carregar dados offline');
    } finally {
      setIsInitialized(true);
    }
  };

  const loadPendingOperations = async () => {
    try {
      const operations = await offlineStorage.getPendingOperations();
      setPendingOperations(operations);
      console.log('⏳ Operações pendentes carregadas:', operations.length);
    } catch (error) {
      console.error('❌ Erro ao carregar operações pendentes:', error);
    }
  };

  // Sincronizar dados offline quando voltar online
  const syncOfflineData = useCallback(async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    console.log('🔄 Iniciando sincronização...');
    
    try {
      // 1. Executar operações pendentes
      await executePendingOperations();
      
      // 2. Salvar dados atuais no cache offline
      await saveCurrentDataToOffline();
      
      // 3. Atualizar timestamp de sincronização
      await offlineStorage.saveMetadata('lastSync', new Date().toISOString());
      
      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing]);

  const executePendingOperations = async () => {
    const operations = await offlineStorage.getPendingOperations();
    
    for (const operation of operations) {
      try {
        await executeOperation(operation);
        await offlineStorage.removePendingOperation(operation.id);
        console.log('✅ Operação executada:', operation.type, operation.table);
      } catch (error) {
        console.error('❌ Erro ao executar operação:', operation, error);
      }
    }
  };

  const executeOperation = async (operation: PendingOperation) => {
    // Implementar execução de operações pendentes
    // Por exemplo, reenviar dados para o Supabase
    console.log('Executando operação pendente:', operation);
  };

  const saveCurrentDataToOffline = async () => {
    if (!user) return;
    
    try {
      // Salvar hábitos atuais
      for (const habit of supabaseData.habits) {
        await offlineStorage.saveHabit(habit);
      }
      
      // Salvar conclusões atuais
      for (const completion of supabaseData.completions) {
        await offlineStorage.saveCompletion({
          ...completion,
          user_id: user.id
        });
      }
      
      // Salvar conquistas atuais
      for (const achievementId of supabaseData.unlockedAchievements) {
        await offlineStorage.saveAchievement({
          id: `${user.id}-${achievementId}`,
          user_id: user.id,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados atuais:', error);
    }
  };

  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      if (isOnline) {
        // Online: usar Supabase
        const result = await supabaseData.addHabit(habit);
        // Salvar também offline
        await offlineStorage.saveHabit(result);
        return result;
      } else {
        // Offline: salvar localmente e adicionar à fila
        const newHabit: Habit = {
          ...habit,
          id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        
        await offlineStorage.saveHabit(newHabit);
        await offlineStorage.addPendingOperation({
          id: `op-${Date.now()}`,
          type: 'create',
          table: 'habits',
          data: habit,
          timestamp: new Date().toISOString()
        });
        
        // Atualizar estado local
        setOfflineData(prev => ({
          ...prev,
          habits: [newHabit, ...prev.habits]
        }));
        
        return newHabit;
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar hábito:', error);
      throw error;
    }
  }, [user, isOnline, supabaseData, offlineStorage]);

  const deleteHabit = useCallback(async (habitId: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      if (isOnline) {
        // Online: deletar do Supabase
        await supabaseData.deleteHabit(habitId);
        // Remover também do cache offline
        await offlineStorage.deleteHabit(habitId);
      } else {
        // Offline: remover localmente e adicionar à fila
        await offlineStorage.deleteHabit(habitId);
        await offlineStorage.addPendingOperation({
          id: `op-${Date.now()}`,
          type: 'delete',
          table: 'habits',
          data: { id: habitId },
          timestamp: new Date().toISOString()
        });
        
        // Atualizar estado local
        setOfflineData(prev => ({
          ...prev,
          habits: prev.habits.filter(h => h.id !== habitId)
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao deletar hábito:', error);
      throw error;
    }
  }, [user, isOnline, supabaseData, offlineStorage]);

  const toggleCompletion = useCallback(async (habitId: string, value?: number): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      if (isOnline) {
        // Online: usar Supabase
        await supabaseData.toggleCompletion(habitId, value);
      } else {
        // Offline: implementar lógica local
        // (Simplificado - em produção seria mais complexo)
        console.log('📴 Toggle offline:', habitId, value);
      }
    } catch (error) {
      console.error('❌ Erro ao toggle conclusão:', error);
      throw error;
    }
  }, [user, isOnline, supabaseData]);

  const addAchievement = useCallback(async (achievementId: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      if (isOnline) {
        // Online: usar Supabase
        await supabaseData.addAchievement(achievementId);
      } else {
        // Offline: salvar localmente
        await offlineStorage.saveAchievement({
          id: `${user.id}-${achievementId}`,
          user_id: user.id,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        });
        
        // Atualizar estado local
        setOfflineData(prev => ({
          ...prev,
          unlockedAchievements: new Set([...prev.unlockedAchievements, achievementId])
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar conquista:', error);
      throw error;
    }
  }, [user, isOnline, supabaseData, offlineStorage]);

  const refreshData = useCallback(async (): Promise<void> => {
    if (isOnline) {
      await supabaseData.refreshData();
    } else {
      await loadOfflineData();
    }
  }, [isOnline, supabaseData]);

  // Retornar dados baseados no status de conexão
  return {
    habits: isOnline ? supabaseData.habits : offlineData.habits,
    completions: isOnline ? supabaseData.completions : offlineData.completions,
    unlockedAchievements: isOnline ? supabaseData.unlockedAchievements : offlineData.unlockedAchievements,
    loading: !isInitialized || supabaseData.loading || isSyncing,
    error: supabaseData.error || offlineError,
    isOnline,
    addHabit,
    deleteHabit,
    toggleCompletion,
    addAchievement,
    refreshData,
    syncOfflineData
  };
};
