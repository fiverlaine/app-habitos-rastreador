# 🔔 Edge Function: Process Reminders

Esta Supabase Edge Function processa a fila de lembretes e dispara notificações push através do backend.

## 📋 Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no Supabase Dashboard:

```bash
PUSH_SERVER_URL=https://seu-backend-de-push.com
CRON_SECRET=seu_secret_forte_aqui
```

### 2. Deploy da Edge Function

```bash
# Fazer login no Supabase CLI
supabase login

# Link do projeto
supabase link --project-ref jiohwtmymnizvwzyvdef

# Deploy da função
supabase functions deploy process-reminders
```

### 3. Configurar Cron Job

No Supabase Dashboard, vá em **Database > Cron Jobs** e crie:

```sql
-- Executar a cada 5 minutos
SELECT cron.schedule(
  'process-reminders-job',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/process-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer SEU_CRON_SECRET"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

**Ou usar pg_cron mais simples:**

```sql
-- Habilitar extensão pg_cron (se ainda não estiver)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar job que roda a cada 5 minutos
SELECT cron.schedule(
  'process-reminders',
  '*/5 * * * *',
  $$ 
  SELECT net.http_post(
    url := 'https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/process-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SEU_CRON_SECRET_AQUI'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### 4. Alternativa: Usar Cron Externo

Se preferir, use um serviço de cron externo (cron-job.org, EasyCron, etc):

**URL:** `https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/process-reminders`  
**Método:** `POST`  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer SEU_CRON_SECRET`

**Frequência:** A cada 5 minutos

## 🧪 Teste Manual

Você pode testar a função manualmente:

```bash
curl -X POST \
  https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/process-reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

## 📊 Monitoramento

Verifique os logs no Supabase Dashboard em **Edge Functions > process-reminders > Logs**.

## 🔒 Segurança

- A função valida o `CRON_SECRET` para evitar chamadas não autorizadas
- Use um secret forte e único para produção
- O backend também valida o secret antes de processar

