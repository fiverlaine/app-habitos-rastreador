# 🔧 Corrigir Erro 401 na Edge Function

## Problema
A Edge Function `send-reminders` está retornando **401 Unauthorized** quando chamada pelo cron job.

## Causa
A função está configurada com `verify_jwt: true`, mas o cron job interno do Supabase não envia token JWT.

## Solução (Escolha uma das opções)

### ✅ Opção 1: Desabilitar Verify JWT (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **Edge Functions** → **send-reminders**
3. Clique na aba **Details**
4. **Desmarque** a opção **"Verify JWT"**
5. Salve as alterações

A função já tem validação interna usando `x-service-key` para segurança.

### ✅ Opção 2: Atualizar Cron Job com Service Role Key

Se preferir manter `verify_jwt: true`, atualize o cron job:

```sql
-- Obter a service_role_key do projeto
-- (Substitua pela sua chave real do Supabase Dashboard → Settings → API)

SELECT cron.unschedule('send-reminders-every-minute');

SELECT cron.schedule(
    'send-reminders-every-minute',
    '* * * * *',
    $$
    SELECT net.http_post(
        url := 'https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/send-reminders',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-service-key', 'SUA_SERVICE_ROLE_KEY_AQUI'
        )
    ) as request_id;
    $$
);
```

**⚠️ IMPORTANTE**: Substitua `SUA_SERVICE_ROLE_KEY_AQUI` pela chave real do seu projeto.

## Como Encontrar a Service Role Key

1. Supabase Dashboard → **Settings** → **API**
2. Copie a **`service_role`** key (secreta!)
3. Use no cron job acima

## Testar

Após aplicar uma das soluções:

1. Acesse **Edge Functions** → **send-reminders** → **Invocations**
2. Veja se os status mudaram de `401` para `200`
3. Verifique os logs para confirmar o processamento

## Atualização da Edge Function

A função já foi atualizada (versão 7) para aceitar autenticação via:
- **JWT** (Authorization header) - para chamadas de usuários
- **x-service-key** (header customizado) - para cron jobs internos

A função valida internamente e usa `service_role_key` para acessar o banco.

