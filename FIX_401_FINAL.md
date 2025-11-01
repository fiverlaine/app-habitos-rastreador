# 🔧 Solução Final para Erro 401

## ⚠️ Problema Persistente

Mesmo após desabilitar "Verify JWT" no dashboard, a função ainda retorna 401.

## ✅ Solução Definitiva

O problema é que o Supabase pode precisar de um **redeploy** da função após desabilitar o verify_jwt, ou há cache. Vamos usar uma abordagem que funciona independente da configuração:

### Opção 1: Verificar e Forçar Redeploy

1. **No Supabase Dashboard**:
   - Vá em **Edge Functions** → **send-reminders**
   - Clique em **Details**
   - **DESMARQUE** "Verify JWT" (se ainda estiver marcado)
   - **SALVE**
   - Clique em **"Redeploy"** ou faça uma pequena alteração no código e salve novamente

2. **Aguarde 1-2 minutos** para o cache limpar

3. **Teste novamente** verificando os logs em **Invocations**

### Opção 2: Usar Service Role Key no Cron Job

Se a Opção 1 não funcionar, atualize o cron job para usar a service_role_key:

```sql
-- 1. Obter sua SERVICE_ROLE_KEY:
-- Supabase Dashboard → Settings → API → service_role (chave secreta!)

-- 2. Atualizar o cron job:
SELECT cron.unschedule('send-reminders-every-minute');

SELECT cron.schedule(
    'send-reminders-every-minute',
    '* * * * *',
    $$
    SELECT net.http_post(
        url := 'https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/send-reminders',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer SUA_SERVICE_ROLE_KEY_AQUI'
        ),
        body := '{}'::jsonb
    ) as request_id;
    $$
);
```

**⚠️ IMPORTANTE**: Substitua `SUA_SERVICE_ROLE_KEY_AQUI` pela sua chave real!

### Opção 3: Database Webhook (Mais Robusto)

Em vez de cron job, use um Database Webhook que dispara automaticamente quando há novos lembretes:

1. **Supabase Dashboard** → **Database** → **Webhooks**
2. **Criar novo webhook**:
   - **Table**: `reminder_queue`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **URL**: `https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/send-reminders`
   - **HTTP Method**: `POST`
   - **HTTP Headers**: 
     ```json
     {
       "Content-Type": "application/json",
       "Authorization": "Bearer SUA_SERVICE_ROLE_KEY"
     }
     ```

## 🔍 Como Verificar se Funcionou

1. Acesse **Edge Functions** → **send-reminders** → **Invocations**
2. Veja se os novos requests têm status **200** (não mais 401)
3. Verifique os **Logs** para ver mensagens de sucesso

## 📝 Nota sobre Segurança

A função usa `service_role_key` internamente, então mesmo sem JWT, ela já tem acesso completo ao banco. A desabilitação do verify_jwt é segura para este caso de uso (cron job interno).

