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
        scheduledTimes: h.scheduled_times || [],
        timeOfDay: h.time_of_day || 'anytime',
        reminderEnabled: h.reminder_enabled !== false, // default true
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
          scheduled_times: habit.scheduledTimes || [],
          time_of_day: habit.timeOfDay || 'anytime',
          reminder_enabled: habit.reminderEnabled !== false,
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
        scheduledTimes: data.scheduled_times || [],
        timeOfDay: data.time_of_day || 'anytime',
        reminderEnabled: data.reminder_enabled !== false,
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
      } else if (habit.type === 'numeric') {
        if (value !== undefined) {
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
        } else {
          // Se chamado sem valor, é um toggle - remover todas as conclusões do dia
          const todayCompletions = completions.filter(
            c => c.habitId === habitId && c.date === todayStr
          );

          if (todayCompletions.length > 0) {
            // Remover todas as conclusões de hoje
            const { error } = await supabase
              .from('completions')
              .delete()
              .in('id', todayCompletions.map(c => c.id))
              .eq('user_id', user.id);

            if (error) throw error;

            setCompletions(prev => prev.filter(c => !todayCompletions.some(tc => tc.id === c.id)));
          }
        }
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

  // Atualizar hábito
  const updateHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .update({
          name: updates.name,
          icon: updates.icon,
          color: updates.color,
          type: updates.type,
          unit: updates.unit || null,
          target_value: updates.targetValue || null,
          scheduled_times: updates.scheduledTimes,
          time_of_day: updates.timeOfDay,
          reminder_enabled: updates.reminderEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, ...updates } : h
      ));
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      throw error;
    }
  }, [user]);

  return {
    habits,
    completions,
    unlockedAchievements,
    loading,
    error,
    addHabit,
    deleteHabit,
    updateHabit,
    toggleCompletion,
    addAchievement,
  };
};

