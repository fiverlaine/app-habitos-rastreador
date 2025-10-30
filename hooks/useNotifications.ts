import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Habit } from '../types';
import type { User } from '@supabase/supabase-js';

const FALLBACK_VAPID_PUBLIC_KEY = 'BP4L9SbKHcdfcUTd0vNV5vbDkWNx87NKe_kgr6UptP1SYTF0IFrBhale1ZwIqP389aElq8mG4BGsf_9Oq6QT0rk';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4 || 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

interface NotificationPermissionState {
    permission: NotificationPermission;
    isSupported: boolean;
    isSubscribed: boolean;
}

export const useNotifications = (user: User | null) => {
    const [state, setState] = useState<NotificationPermissionState>({
        permission: 'default',
        isSupported: false,
        isSubscribed: false,
    });

    const vapidPublicKey = useMemo(() => {
        const keyFromEnv = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
        if (keyFromEnv && keyFromEnv.trim().length > 0) {
            return keyFromEnv.trim();
        }
        return FALLBACK_VAPID_PUBLIC_KEY;
    }, []);

    const getServiceWorkerRegistration = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
        if (!('serviceWorker' in navigator)) {
            return null;
        }

        try {
            return await navigator.serviceWorker.ready;
        } catch (error) {
            console.error('Erro ao recuperar registration do service worker:', error);
            return null;
        }
    }, []);

    const checkSubscription = useCallback(async () => {
        if (!user) {
            setState(prev => ({ ...prev, isSubscribed: false }));
            return { hasDbSubscription: false, hasLocalSubscription: false };
        }

        try {
            const registration = await getServiceWorkerRegistration();
            const hasPushManager = Boolean(registration?.pushManager);
            let localSubscriptionExists = false;

            if (hasPushManager) {
                try {
                    const localSubscription = await registration!.pushManager.getSubscription();
                    localSubscriptionExists = localSubscription !== null;
                } catch (error) {
                    console.error('Erro ao consultar subscription local:', error);
                }
            }

            const { data, error } = await supabase
                .from('web_push_subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .limit(1);

            if (error) {
                console.error('Erro ao consultar subscriptions:', error);
            }

            const hasDbSubscription = Boolean(data && data.length > 0);

            setState(prev => ({
                ...prev,
                isSubscribed: hasDbSubscription && (!hasPushManager || localSubscriptionExists),
            }));

            return { hasDbSubscription, hasLocalSubscription: localSubscriptionExists };
        } catch (err) {
            console.error('Erro ao verificar subscription:', err);
            setState(prev => ({ ...prev, isSubscribed: false }));
            return { hasDbSubscription: false, hasLocalSubscription: false };
        }
    }, [getServiceWorkerRegistration, user]);

    useEffect(() => {
        const hasNotifications = typeof window !== 'undefined' && 'Notification' in window;
        const hasServiceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

        const isSupported = hasNotifications && hasServiceWorker;

        console.log('📱 Suporte a notificações:', {
            hasNotifications,
            hasServiceWorker,
            isSupported,
        });

        setState(prev => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : 'denied',
        }));

        if (isSupported && user) {
            checkSubscription();
        }
    }, [checkSubscription, user]);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!state.isSupported || !user) {
            console.warn('Notificações não são suportadas ou usuário não logado');
            return false;
        }

        try {
            // Solicitar permissão de notificação
            const permission = await Notification.requestPermission();
            setState(prev => ({ ...prev, permission }));
            
            console.log('📬 Permissão de notificação:', permission);
            
            if (permission !== 'granted') {
                console.warn('❌ Permissão de notificação negada');
                return false;
            }

            const registration = await getServiceWorkerRegistration();

            if (!registration) {
                console.warn('⚠️ Service Worker não está pronto.');
                return true;
            }

            if (!registration.pushManager) {
                console.log('📱 Navegador sem PushManager. Somente notificações locais disponíveis.');
                return true;
            }

            const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

            try {
                const existing = await registration.pushManager.getSubscription();
                const subscription = existing ?? await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
                });

                const subscriptionJSON = subscription.toJSON();

                const { error } = await supabase
                    .from('web_push_subscriptions')
                    .upsert({
                        user_id: user.id,
                        endpoint: subscriptionJSON.endpoint,
                        keys: subscriptionJSON.keys ?? {},
                    }, {
                        onConflict: 'endpoint',
                    });

                if (error && error.code !== '23505') {
                    console.error('Erro ao salvar subscription:', error);
                    return false;
                }

                await checkSubscription();
                console.log('✅ Subscription push salva!');
            } catch (pushError) {
                console.warn('⚠️ Erro ao registrar PushManager:', pushError);
                console.log('✅ Notificações locais ativadas (sem push)');
            }

            return true;
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            return false;
        }
    }, [checkSubscription, getServiceWorkerRegistration, state.isSupported, user, vapidPublicKey]);

    const scheduleNotification = useCallback(async (habit: Habit) => {
        if (!state.isSupported || state.permission !== 'granted' || !user) {
            console.warn('Notificações não disponíveis');
            return;
        }

        if (!habit.reminderEnabled || !habit.scheduledTimes || habit.scheduledTimes.length === 0) {
            return;
        }

        try {
            // Inserir lembretes na fila do Supabase
            for (const time of habit.scheduledTimes) {
                const [hours, minutes] = time.split(':').map(Number);
                const now = new Date();
                const scheduledTime = new Date();
                scheduledTime.setHours(hours, minutes, 0, 0);

                // Se o horário já passou hoje, agendar para amanhã
                if (scheduledTime <= now) {
                    scheduledTime.setDate(scheduledTime.getDate() + 1);
                }

                const { error } = await supabase
                    .from('reminder_queue')
                    .insert({
                        user_id: user.id,
                        habit_id: habit.id,
                        scheduled_at: scheduledTime.toISOString(),
                        sent: false,
                    });

                if (error && error.code !== '23505') {
                    console.error('Erro ao agendar lembrete:', error);
                }
            }

            console.log(`✅ Lembretes agendados para ${habit.name}`);
        } catch (error) {
            console.error('Erro ao agendar notificação:', error);
        }
    }, [state.isSupported, state.permission, user]);

    const scheduleAllNotifications = useCallback(async (habits: Habit[]) => {
        if (state.permission !== 'granted') {
            return;
        }

        const habitsWithReminders = habits.filter(h => h.reminderEnabled && h.scheduledTimes && h.scheduledTimes.length > 0);

        await Promise.all(habitsWithReminders.map(scheduleNotification));
    }, [state.permission, scheduleNotification]);

    const sendTestNotification = useCallback(async (habitName: string = 'Teste') => {
        if (!state.isSupported || state.permission !== 'granted') {
            console.warn('Notificações não disponíveis');
            return false;
        }

        try {
            const registration = await getServiceWorkerRegistration();

            if (!registration) {
                console.warn('⚠️ Service Worker não disponível para enviar notificação de teste.');
                return false;
            }

            const notificationOptions: NotificationOptions = {
                body: 'Este é um teste de notificação!',
                tag: 'test-notification',
                requireInteraction: false,
                vibrate: [200, 100, 200],
            };

            if ('showNotification' in registration) {
                await registration.showNotification(`🎯 ${habitName}`, notificationOptions);
                return true;
            }

            if (typeof Notification === 'function') {
                new Notification(`🎯 ${habitName}`, notificationOptions);
                return true;
            }

            console.warn('⚠️ API de notificação direta não disponível.');
            return false;
        } catch (error) {
            console.error('Erro ao enviar notificação de teste:', error);
            return false;
        }
    }, [getServiceWorkerRegistration, state.isSupported, state.permission]);

    const sendStreakReminderNotification = useCallback(async (habitName: string, currentStreak: number) => {
        if (!state.isSupported || state.permission !== 'granted') {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(`🔥 Não quebre sua sequência!`, {
                body: `Você tem ${currentStreak} dia${currentStreak > 1 ? 's' : ''} de sequência em "${habitName}". Continue firme!`,
                icon: '/manifest.json',
                badge: '/manifest.json',
                tag: `streak-reminder-${habitName}`,
                requireInteraction: true,
                vibrate: [200, 100, 200, 100, 200],
            });
        } catch (error) {
            console.error('Erro ao enviar lembrete de sequência:', error);
        }
    }, [state.isSupported, state.permission]);

    return {
        ...state,
        requestPermission,
        scheduleNotification,
        scheduleAllNotifications,
        sendTestNotification,
        sendStreakReminderNotification,
        vapidPublicKey,
    };
};

