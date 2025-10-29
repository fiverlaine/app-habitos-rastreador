// ========================================
// SERVIDOR BACKEND PARA PUSH NOTIFICATIONS
// ========================================
// Este servidor é responsável por:
// 1. Receber subscriptions do frontend
// 2. Enviar notificações push usando Web Push API

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ========================================
// MIDDLEWARE
// ========================================
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// ========================================
// CONFIGURAÇÃO SUPABASE
// ========================================
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Usar service role para acesso total
);

// ========================================
// CONFIGURAÇÃO VAPID
// ========================================
// As chaves VAPID identificam seu servidor de aplicação
// Gere suas chaves com: npx web-push generate-vapid-keys
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (!publicVapidKey || !privateVapidKey) {
    console.error('❌ ERRO: Chaves VAPID não configuradas!');
    console.log('📝 Para gerar chaves, execute: npx web-push generate-vapid-keys');
    process.exit(1);
}

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@habitos.app',
    publicVapidKey,
    privateVapidKey
);

console.log('✅ VAPID configurado com sucesso');
console.log('📱 Public Key:', publicVapidKey);

// ========================================
// ROTA: Receber subscription do frontend
// ========================================
app.post('/api/subscribe', async (req, res) => {
    const { subscription, userId } = req.body;

    if (!subscription || !userId) {
        return res.status(400).json({ 
            error: 'Subscription e userId são obrigatórios' 
        });
    }

    try {
        // Salvar subscription no Supabase
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            }, {
                onConflict: 'endpoint'
            });

        if (error) {
            console.error('Erro ao salvar subscription:', error);
            return res.status(500).json({ error: 'Erro ao salvar subscription' });
        }

        console.log('✅ Subscription salva para usuário:', userId);
        res.status(201).json({ message: 'Subscription salva com sucesso' });
    } catch (error) {
        console.error('Erro ao processar subscription:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ========================================
// ROTA: Enviar notificação de teste
// ========================================
app.post('/api/test-notification', async (req, res) => {
    const { userId, title, body } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
    }

    try {
        // Buscar subscriptions do usuário
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

        if (error || !subscriptions || subscriptions.length === 0) {
            return res.status(404).json({ 
                error: 'Nenhuma subscription encontrada para este usuário' 
            });
        }

        const notificationPayload = JSON.stringify({
            title: title || '🎯 Teste de Notificação',
            body: body || 'Esta é uma notificação de teste do seu app de hábitos!',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: {
                url: '/',
                timestamp: Date.now()
            }
        });

        // Enviar para todas as subscriptions do usuário
        const sendPromises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys
            };
            
            return webpush.sendNotification(pushSubscription, notificationPayload)
                .catch(err => {
                    console.error('Erro ao enviar para subscription:', err);
                    // Se subscription expirou, remover do banco
                    if (err.statusCode === 410) {
                        supabase
                            .from('push_subscriptions')
                            .delete()
                            .eq('id', sub.id)
                            .then(() => console.log('Subscription expirada removida'));
                    }
                });
        });

        await Promise.all(sendPromises);

        console.log(`✅ Notificação de teste enviada para ${subscriptions.length} dispositivo(s)`);
        res.status(200).json({ 
            message: 'Notificação enviada com sucesso',
            deviceCount: subscriptions.length
        });
    } catch (error) {
        console.error('Erro ao enviar notificação de teste:', error);
        res.status(500).json({ error: 'Erro ao enviar notificação' });
    }
});

// ========================================
// ROTA: Processar fila de lembretes (chamada por Edge Function)
// ========================================
app.post('/api/send-reminders', async (req, res) => {
    const { secret } = req.body;

    // Validar secret (proteção básica)
    if (secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
        // Buscar lembretes pendentes que devem ser enviados agora
        const now = new Date();
        const { data: reminders, error: remindersError } = await supabase
            .from('reminder_queue')
            .select(`
                *,
                habits (name, icon, color),
                push_subscriptions!inner(user_id, endpoint, keys)
            `)
            .eq('sent', false)
            .lte('scheduled_at', now.toISOString())
            .limit(50);

        if (remindersError) {
            throw remindersError;
        }

        if (!reminders || reminders.length === 0) {
            return res.status(200).json({ 
                message: 'Nenhum lembrete pendente',
                processed: 0
            });
        }

        console.log(`📬 Processando ${reminders.length} lembretes...`);

        // Agrupar por usuário e hábito
        const remindersByUser = new Map();
        reminders.forEach(reminder => {
            const key = `${reminder.user_id}-${reminder.habit_id}`;
            if (!remindersByUser.has(key)) {
                remindersByUser.set(key, reminder);
            }
        });

        let successCount = 0;

        // Enviar notificações
        for (const [key, reminder] of remindersByUser) {
            try {
                // Buscar todas as subscriptions do usuário
                const { data: subscriptions } = await supabase
                    .from('push_subscriptions')
                    .select('*')
                    .eq('user_id', reminder.user_id);

                if (!subscriptions || subscriptions.length === 0) {
                    console.log(`⚠️ Nenhuma subscription para usuário ${reminder.user_id}`);
                    continue;
                }

                const habit = reminder.habits;
                const notificationPayload = JSON.stringify({
                    title: `🎯 ${habit.name}`,
                    body: 'Hora de completar seu hábito! Não quebre sua sequência 🔥',
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    data: {
                        habitId: reminder.habit_id,
                        url: '/',
                        timestamp: Date.now()
                    },
                    vibrate: [200, 100, 200],
                    requireInteraction: true
                });

                // Enviar para todos os dispositivos do usuário
                const sendPromises = subscriptions.map(sub => {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: sub.keys
                    };
                    
                    return webpush.sendNotification(pushSubscription, notificationPayload)
                        .catch(err => {
                            console.error('Erro ao enviar push:', err);
                            if (err.statusCode === 410) {
                                supabase
                                    .from('push_subscriptions')
                                    .delete()
                                    .eq('id', sub.id);
                            }
                        });
                });

                await Promise.all(sendPromises);

                // Marcar lembrete como enviado
                await supabase
                    .from('reminder_queue')
                    .update({ sent: true })
                    .eq('id', reminder.id);

                successCount++;
                console.log(`✅ Lembrete enviado: ${habit.name} para usuário ${reminder.user_id}`);
            } catch (err) {
                console.error('Erro ao processar lembrete:', err);
            }
        }

        res.status(200).json({ 
            message: 'Lembretes processados',
            processed: successCount,
            total: reminders.length
        });
    } catch (error) {
        console.error('Erro ao processar fila de lembretes:', error);
        res.status(500).json({ error: 'Erro ao processar lembretes' });
    }
});

// ========================================
// ROTA: Health Check
// ========================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        vapidConfigured: !!(publicVapidKey && privateVapidKey),
        supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
        timestamp: new Date().toISOString()
    });
});

// ========================================
// ROTA: Obter chave pública VAPID
// ========================================
app.get('/api/vapid-public-key', (req, res) => {
    res.json({ publicKey: publicVapidKey });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 Servidor de Push Notifications');
    console.log('========================================');
    console.log(`📡 Rodando na porta: ${PORT}`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`🔐 VAPID Public Key: ${publicVapidKey}`);
    console.log('========================================');
});

