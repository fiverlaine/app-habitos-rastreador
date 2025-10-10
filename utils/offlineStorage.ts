import type { Habit, Completion } from '../types';

export interface OfflineData {
  habits: Habit[];
  completions: Completion[];
  achievements: { id: string; user_id: string; achievement_id: string; unlocked_at: string }[];
  lastSync: string;
}

export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'habits' | 'completions' | 'achievements';
  data: any;
  timestamp: string;
}

export class OfflineStorage {
  private static instance: OfflineStorage;
  private dbName = 'habitos-offline-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      // Verificar se IndexedDB está disponível
      if (!('indexedDB' in window)) {
        const error = new Error('IndexedDB não está disponível neste navegador');
        console.error('❌ IndexedDB não suportado:', error);
        reject(error);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        const error = request.error || new Error('Erro desconhecido ao abrir IndexedDB');
        console.error('❌ Erro ao abrir IndexedDB:', error);
        reject(error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB inicializado');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('🔄 Criando estrutura do IndexedDB...');
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store para hábitos
        if (!db.objectStoreNames.contains('habits')) {
          const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
          habitStore.createIndex('userId', 'user_id', { unique: false });
          habitStore.createIndex('createdAt', 'created_at', { unique: false });
        }
        
        // Store para conclusões
        if (!db.objectStoreNames.contains('completions')) {
          const completionStore = db.createObjectStore('completions', { keyPath: 'id' });
          completionStore.createIndex('userId', 'user_id', { unique: false });
          completionStore.createIndex('habitId', 'habit_id', { unique: false });
          completionStore.createIndex('date', 'date', { unique: false });
        }
        
        // Store para conquistas
        if (!db.objectStoreNames.contains('achievements')) {
          const achievementStore = db.createObjectStore('achievements', { keyPath: 'id' });
          achievementStore.createIndex('userId', 'user_id', { unique: false });
          achievementStore.createIndex('achievementId', 'achievement_id', { unique: false });
        }

        // Store para operações pendentes
        if (!db.objectStoreNames.contains('pendingOperations')) {
          const pendingStore = db.createObjectStore('pendingOperations', { keyPath: 'id' });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
          pendingStore.createIndex('table', 'table', { unique: false });
        }

        // Store para metadados
        if (!db.objectStoreNames.contains('metadata')) {
          const metadataStore = db.createObjectStore('metadata', { keyPath: 'key' });
        }

        console.log('✅ Estrutura do IndexedDB criada');
      };
    });
  }

  // === HÁBITOS ===
  async saveHabit(habit: Habit): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['habits'], 'readwrite');
    const store = transaction.objectStore('habits');
    await store.put(habit);
    console.log('💾 Hábito salvo offline:', habit.name);
  }

  async getHabits(userId: string): Promise<Habit[]> {
    const db = await this.initDB();
    const transaction = db.transaction(['habits'], 'readonly');
    const store = transaction.objectStore('habits');
    const index = store.index('userId');
    const result = await index.getAll(userId);
    return result as Habit[];
  }

  async deleteHabit(habitId: string): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['habits'], 'readwrite');
    const store = transaction.objectStore('habits');
    await store.delete(habitId);
    console.log('🗑️ Hábito removido offline:', habitId);
  }

  // === CONCLUSÕES ===
  async saveCompletion(completion: Completion & { user_id: string }): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['completions'], 'readwrite');
    const store = transaction.objectStore('completions');
    await store.put(completion);
    console.log('💾 Conclusão salva offline:', completion.id);
  }

  async getCompletions(userId: string): Promise<(Completion & { user_id: string })[]> {
    const db = await this.initDB();
    const transaction = db.transaction(['completions'], 'readonly');
    const store = transaction.objectStore('completions');
    const index = store.index('userId');
    const result = await index.getAll(userId);
    return result as (Completion & { user_id: string })[];
  }

  async deleteCompletion(completionId: string): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['completions'], 'readwrite');
    const store = transaction.objectStore('completions');
    await store.delete(completionId);
    console.log('🗑️ Conclusão removida offline:', completionId);
  }

  // === CONQUISTAS ===
  async saveAchievement(achievement: { id: string; user_id: string; achievement_id: string; unlocked_at: string }): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['achievements'], 'readwrite');
    const store = transaction.objectStore('achievements');
    await store.put(achievement);
    console.log('🏆 Conquista salva offline:', achievement.achievement_id);
  }

  async getAchievements(userId: string): Promise<{ id: string; user_id: string; achievement_id: string; unlocked_at: string }[]> {
    const db = await this.initDB();
    const transaction = db.transaction(['achievements'], 'readonly');
    const store = transaction.objectStore('achievements');
    const index = store.index('userId');
    const result = await index.getAll(userId);
    return result;
  }

  // === OPERAÇÕES PENDENTES ===
  async addPendingOperation(operation: PendingOperation): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['pendingOperations'], 'readwrite');
    const store = transaction.objectStore('pendingOperations');
    await store.put(operation);
    console.log('⏳ Operação adicionada à fila:', operation.type, operation.table);
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    const db = await this.initDB();
    const transaction = db.transaction(['pendingOperations'], 'readonly');
    const store = transaction.objectStore('pendingOperations');
    const result = await store.getAll();
    return result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async clearPendingOperations(): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['pendingOperations'], 'readwrite');
    const store = transaction.objectStore('pendingOperations');
    await store.clear();
    console.log('✅ Fila de operações pendentes limpa');
  }

  async removePendingOperation(operationId: string): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['pendingOperations'], 'readwrite');
    const store = transaction.objectStore('pendingOperations');
    await store.delete(operationId);
  }

  // === METADADOS ===
  async saveMetadata(key: string, value: any): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['metadata'], 'readwrite');
    const store = transaction.objectStore('metadata');
    await store.put({ key, value });
  }

  async getMetadata(key: string): Promise<any> {
    const db = await this.initDB();
    const transaction = db.transaction(['metadata'], 'readonly');
    const store = transaction.objectStore('metadata');
    const result = await store.get(key);
    return result?.value;
  }

  // === UTILITÁRIOS ===
  async getAllOfflineData(userId: string): Promise<OfflineData> {
    const [habits, completions, achievements, lastSync] = await Promise.all([
      this.getHabits(userId),
      this.getCompletions(userId),
      this.getAchievements(userId),
      this.getMetadata('lastSync') || new Date().toISOString()
    ]);

    return {
      habits,
      completions,
      achievements,
      lastSync
    };
  }

  async clearAllData(): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['habits', 'completions', 'achievements', 'pendingOperations', 'metadata'], 'readwrite');
    
    await Promise.all([
      transaction.objectStore('habits').clear(),
      transaction.objectStore('completions').clear(),
      transaction.objectStore('achievements').clear(),
      transaction.objectStore('pendingOperations').clear(),
      transaction.objectStore('metadata').clear()
    ]);

    console.log('🗑️ Todos os dados offline foram limpos');
  }

  async getStorageSize(): Promise<{ used: number; total: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0
      };
    }
    return { used: 0, total: 0 };
  }
}
