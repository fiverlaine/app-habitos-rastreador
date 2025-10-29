// ========================================
// SUPABASE EDGE FUNCTION: Process Reminders
// ========================================
// Esta função é executada periodicamente (via cron) para:
// 1. Buscar lembretes pendentes na reminder_queue
// 2. Chamar o backend para enviar notificações push
// 3. Marcar lembretes como enviados

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const PUSH_SERVER_URL = Deno.env.get('PUSH_SERVER_URL') || 'http://localhost:5000';
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';

interface ReminderQueueItem {
  id: string;
  user_id: string;
  habit_id: string;
  scheduled_at: string;
  sent: boolean;
  created_at: string;
}

Deno.serve(async (req: Request) => {
  // Verificar método
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verificar autenticação (via cron secret ou authorization header)
    const authHeader = req.headers.get('Authorization');
    const expectedAuth = `Bearer ${CRON_SECRET}`;
    
    if (authHeader !== expectedAuth && !CRON_SECRET) {
      console.warn('⚠️ CRON_SECRET não configurado - executando sem autenticação');
    }

    if (authHeader !== expectedAuth && CRON_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Iniciando processamento de lembretes...');

    // Chamar o backend para processar os lembretes
    const response = await fetch(`${PUSH_SERVER_URL}/api/send-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: CRON_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro ao processar lembretes:', error);
      throw new Error(`Erro do servidor de push: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Lembretes processados:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lembretes processados com sucesso',
        data: result,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Erro ao processar lembretes:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

