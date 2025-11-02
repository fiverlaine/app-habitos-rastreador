-- migration: fix security and performance issues
-- purpose: correct search_path in function, add missing index, remove duplicate index
-- date: 2025-01-31
-- includes: 
--   1. Fix search_path in schedule_habit_reminders function (security)
--   2. Create index on reminder_queue.habit_id (performance)
--   3. Remove duplicate index in web_push_subscriptions (performance)

-- ============================================
-- 1. CORRIGIR SEARCH_PATH NA FUNÇÃO (SEGURANÇA)
-- ============================================
-- Adiciona SET search_path fixo para prevenir SQL injection
DROP FUNCTION IF EXISTS public.schedule_habit_reminders() CASCADE;

CREATE OR REPLACE FUNCTION public.schedule_habit_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    h RECORD;
    t text;
    sched timestamp;
BEGIN
    -- Loop em hábitos com lembretes ativos
    FOR h IN SELECT * FROM public.habits WHERE reminder_enabled = true AND array_length(scheduled_times,1) > 0 LOOP
        -- Para cada horário configurado
        FOREACH t IN ARRAY h.scheduled_times LOOP
            -- Converter HH:MI em timestamptz hoje
            sched := date_trunc('day', now()) + (t::time);
            IF sched < now() THEN
                sched := sched + interval '1 day';
            END IF;

            -- Inserir na fila se ainda não existe
            INSERT INTO public.reminder_queue(user_id, habit_id, scheduled_at)
            VALUES (h.user_id, h.id, sched)
            ON CONFLICT (user_id, habit_id, scheduled_at) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION public.schedule_habit_reminders() IS 'Agenda lembretes de hábitos na fila reminder_queue. Função com search_path fixo para segurança.';

-- ============================================
-- 2. CRIAR ÍNDICE EM REMINDER_QUEUE.HABIT_ID (PERFORMANCE)
-- ============================================
-- Melhora performance de queries que filtram por habit_id
CREATE INDEX IF NOT EXISTS reminder_queue_habit_id_idx 
ON public.reminder_queue (habit_id);

COMMENT ON INDEX reminder_queue_habit_id_idx IS 'Índice para melhorar performance de queries que filtram lembretes por hábito.';

-- ============================================
-- 3. REMOVER ÍNDICE DUPLICADO (PERFORMANCE)
-- ============================================
-- Remove índice antigo, mantém o mais recente (web_push_subscriptions_user_id_idx)
DROP INDEX IF EXISTS public.idx_push_subscriptions_user_id;

COMMENT ON INDEX web_push_subscriptions_user_id_idx IS 'Índice para melhorar performance de queries que filtram subscriptions por usuário. Mantido após remoção de índice duplicado.';

