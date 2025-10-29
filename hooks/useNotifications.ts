import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Habit } from '../types';
import type { User } from '@supabase/supabase-js';

// URL do backend de push notifications
const PUSH_SERVER_URL = import.meta.env.VITE_PUSH_SERVER_URL || 'http://localhost:5000';

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
    
    const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);

    // Buscar chave VAPID pública do backend
    useEffect(() => {
        const fetchVapidKey = async () => {
            try {
                const response = await fetch(`${PUSH_SERVER_URL}/api/vapid-public-key`);
                if (response.ok) {
                    const data = await response.json();
                    setVapidPublicKey(data.publicKey);
                    console.log('✅ Chave VAPID pública carregada');
                } else {
                    console.error('❌ Erro ao buscar chave VAPID:', response.statusText);
                }
            } catch (error) {
                console.error('❌ Erro ao conectar ao servidor de push:', error);
            }
        };

        fetchVapidKey();
    }, []);

    useEffect(() => {
        // Verificar se notificações são suportadas
        const hasNotifications = 'Notification' in window;
        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasPushManager = 'PushManager' in window;
        
        // Verificar se é contexto seguro (HTTPS ou localhost)
        const isSecureContext = window.isSecureContext || 
            window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.match(/^192\.168\./); // IPs locais
        
        // Suporte básico: apenas notificações e service worker
        // Push API requer contexto seguro, mas podemos tentar mesmo assim
        const isSupported = hasNotifications && hasServiceWorker;
        
        console.log('📱 Suporte a notificações:', {
            hasNotifications,
            hasServiceWorker,
            hasPushManager,
            isSecureContext,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            isSupported,
        });
        
        // Avisar se não é contexto seguro mas permitir tentar mesmo assim
        if (!isSecureContext && !isSupported) {
            console.warn('⚠️ Contexto não seguro - Push pode não funcionar via IP sem HTTPS');
        }
        
        setState(prev => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : 'denied',
        }));

        // Verificar se já está inscrito
        if (isSupported && hasPushManager && user && vapidPublicKey) {
            checkSubscription(user);
        }
    }, [user, vapidPublicKey]);

    const checkSubscription = async (user: User) => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Verificar subscription apenas se PushManager existe
            let subscription = null;
            if (registration.pushManager) {
                subscription = await registration.pushManager.getSubscription();
            }
            
            const { data } = await supabase
                .from('push_subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .limit(1);
            
            setState(prev => ({ ...prev, isSubscribed: (subscription !== null && data && data.length > 0) }));
        } catch (err) {
            console.error('Erro ao verificar subscription:', err);
        }
    };

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!state.isSupported || !user) {
            console.warn('Notificações não são suportadas ou usuário não logado');
            return false;
        }

        if (!vapidPublicKey) {
            console.error('❌ Chave VAPID não carregada. Verifique se o servidor está rodando.');
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

            // Verificar se navegador suporta PushManager (Chrome, Firefox, Edge)
            if ('PushManager' in window) {
                try {
                // Registrar subscription push
                const registration = await navigator.serviceWorker.ready;
                
                    // Converter chave VAPID para Uint8Array
                    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
                
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey,
                    });

                    console.log('✅ Push subscription criada');

                    // Preparar objeto de subscription
                    const subscriptionObj = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                            auth: arrayBufferToBase64(subscription.getKey('auth')),
                        },
                    };

                    // Enviar subscription para o backend
                    const response = await fetch(`${PUSH_SERVER_URL}/api/subscribe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            subscription: subscriptionObj,
                        }),
                        });

                    if (!response.ok) {
                        throw new Error('Erro ao registrar subscription no servidor');
                    }

                    setState(prev => ({ ...prev, isSubscribed: true }));
                    console.log('✅ Subscription push registrada com sucesso!');
                } catch (pushError) {
                    console.error('⚠️ Erro ao configurar Push:', pushError);
                    // Mesmo sem Push, notificações locais ainda funcionam
                    console.log('✅ Notificações locais ativadas (sem push remoto)');
                }
            } else {
                console.log('📱 Navegador não suporta Push API');
                console.log('✅ Notificações locais ainda funcionam');
            }

            return true;
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            return false;
        }
    }, [state.isSupported, user, vapidPublicKey]);

    // Helper para converter ArrayBuffer para Base64
    const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
        if (!buffer) return '';
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    // Helper para converter chave VAPID de base64 para Uint8Array
    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

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

                if (error && !error.message.includes('duplicate')) {
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
        
        for (const habit of habitsWithReminders) {
            await scheduleNotification(habit);
        }
    }, [state.permission, scheduleNotification]);

    const sendTestNotification = useCallback(async (habitName: string = 'Teste') => {
        if (!state.isSupported || state.permission !== 'granted') {
            console.warn('Notificações não disponíveis');
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(`🎯 ${habitName}`, {
                body: 'Este é um teste de notificação!',
                icon: '/manifest.json',
                badge: '/manifest.json',
                tag: 'test-notification',
                requireInteraction: false,
                vibrate: [200, 100, 200],
            });
            return true;
        } catch (error) {
            console.error('Erro ao enviar notificação de teste:', error);
            return false;
        }
    }, [state.isSupported, state.permission]);

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
    };
};

