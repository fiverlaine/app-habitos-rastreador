import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Habit, Completion } from '../types';
import type { User } from '@supabase/supabase-js';

export const useSupabaseData = (user: User | null) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setCompletions([]);
      setUnlockedAchievements(new Set());
      setLoading(false);
      setError(null);
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Verificar se está online
      if (!navigator.onLine) {
        console.log('📴 Offline - não carregando dados do Supabase');
        setLoading(false);
        return;
      }

      // Carregar hábitos
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;

      // Carregar conclusões
      const { data: completionsData, error: completionsError } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (completionsError) throw completionsError;

      // Carregar conquistas
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (achievementsError) throw achievementsError;

      // Mapear dados para o formato do app
      const mappedHabits: Habit[] = (habitsData || []).map(h => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        createdAt: h.created_at,
        type: h.type,
        unit: h.unit || undefined,
        targetValue: h.target_value || undefined,
      }));

      const mappedCompletions: Completion[] = (completionsData || []).map(c => ({
        id: c.id,
        habitId: c.habit_id,
        date: c.date,
        value: c.value || undefined,
      }));

      const achievementIds = new Set(
        (achievementsData || []).map(a => a.achievement_id)
      );

      setHabits(mappedHabits);
      setCompletions(mappedCompletions);
      setUnlockedAchievements(achievementIds);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do Supabase');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar hábito
  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          type: habit.type,
          unit: habit.unit || null,
          target_value: habit.targetValue || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newHabit: Habit = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        createdAt: data.created_at,
        type: data.type,
        unit: data.unit || undefined,
        targetValue: data.target_value || undefined,
      };

      setHabits(prev => [newHabit, ...prev]);
      return newHabit;
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error);
      throw error;
    }
  }, [user]);

  // Deletar hábito
  const deleteHabit = useCallback(async (habitId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.filter(h => h.id !== habitId));
      setCompletions(prev => prev.filter(c => c.habitId !== habitId));
    } catch (error) {
      console.error('Erro ao deletar hábito:', error);
      throw error;
    }
  }, [user]);

  // Toggle/adicionar conclusão
  const toggleCompletion = useCallback(async (habitId: string, value?: number) => {
    if (!user) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (habit.type === 'boolean') {
        // Verificar se já existe conclusão hoje
        const existingCompletion = completions.find(
          c => c.habitId === habitId && c.date === todayStr
        );

        if (existingCompletion) {
          // Remover conclusão
          const { error } = await supabase
            .from('completions')
            .delete()
            .eq('id', existingCompletion.id)
            .eq('user_id', user.id);

          if (error) throw error;

          setCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
        } else {
          // Adicionar conclusão
          const { data, error } = await supabase
            .from('completions')
            .insert({
              user_id: user.id,
              habit_id: habitId,
              date: todayStr,
            })
            .select()
            .single();

          if (error) throw error;

          const newCompletion: Completion = {
            id: data.id,
            habitId: data.habit_id,
            date: data.date,
          };

          setCompletions(prev => [...prev, newCompletion]);
        }
      } else if (habit.type === 'numeric' && value !== undefined) {
        // Adicionar valor numérico
        const { data, error } = await supabase
          .from('completions')
          .insert({
            user_id: user.id,
            habit_id: habitId,
            date: todayStr,
            value,
          })
          .select()
          .single();

        if (error) throw error;

        const newCompletion: Completion = {
          id: data.id,
          habitId: data.habit_id,
          date: data.date,
          value: data.value || undefined,
        };

        setCompletions(prev => [...prev, newCompletion]);
      }
    } catch (error) {
      console.error('Erro ao toggle conclusão:', error);
      throw error;
    }
  }, [user, habits, completions]);

  // Adicionar conquista
  const addAchievement = useCallback(async (achievementId: string) => {
    if (!user) return;
    if (unlockedAchievements.has(achievementId)) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        });

      if (error) throw error;

      setUnlockedAchievements(prev => {
        const newSet = new Set(prev);
        newSet.add(achievementId);
        return newSet;
      });
    } catch (error) {
      console.error('Erro ao adicionar conquista:', error);
    }
  }, [user, unlockedAchievements]);

  return {
    habits,
    completions,
    unlockedAchievements,
    loading,
    error,
    addHabit,
    deleteHabit,
    toggleCompletion,
    addAchievement,
    refreshData: loadData,
  };
};

