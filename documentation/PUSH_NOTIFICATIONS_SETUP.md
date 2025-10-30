# 🔔 Setup Completo de Push Notifications (Web Push API)

## ✅ O Que Já Está Implementado

### 1. **Banco de Dados** ✅
- Tabela `web_push_subscriptions` - armazena inscrições push dos usuários com RLS ativada
- Tabela `reminder_queue` - fila de lembretes a enviar (com índice único por usuário/hábito/horário)
- Função SQL `schedule_habit_reminders()` - agenda lembretes
- Migration aplicada com sucesso ✅

### 2. **Edge Function** ✅  
- Função `send-reminders` deployada
- Busca `reminder_queue` pendentes
- Envia push para subscriptions
- Marca como enviado

### 3. **Front-end** ✅
- Hook `useNotifications` completo
- Registra subscription quando usuário permite
- Salva no Supabase
- Agendar lembretes ao criar hábito com horário

### 4. **Service Worker** ✅
- Listener `push` configurado
- Exibe notificação quando recebe
- Click abre o app

---

## ⚠️ PASSO FINAL NECESSÁRIO: Configurar Chaves VAPID

Para **notificações Web Push funcionarem**, você precisa gerar um par de chaves VAPID:

### **Opção 1: Gerar Chaves VAPID Manualmente**

1. Instale `web-push` globalmente:
```bash
npm install -g web-push
```

2. Gere chaves:
```bash
web-push generate-vapid-keys
```

Você receberá algo como:
```
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa1IZSCjX5Fx_ijoaXs7s2P9UzQIHf71PKHyC-k8yB_pHKZ5nHb9-bqg5VsTCo

Private Key:
8rKm6lTHRbh8...

```

### **Opção 2: Use Chaves do Exemplo**

Já configurei chaves de exemplo no código que funcionam para testes.

---

## 🔧 Configurar Edge Function (Se necessário)

Se você gerar novas chaves VAPID, você precisa:

1. **Ir no Supabase Dashboard** → Seu Projeto → Edge Functions → `send-reminders`

2. **Adicionar variáveis de ambiente**:
   - `VAPID_PUBLIC_KEY` = Sua chave pública
   - `VAPID_PRIVATE_KEY` = Sua chave privada

3. **Atualizar o front-end** (`.env.local`):
```env
VITE_VAPID_PUBLIC_KEY="SUA_CHAVE_PUBLICA_AQUI"
```

---

## 🚀 Como Testar AGORA

### **Teste 1: Registrar Subscription**
1. Abra o app no navegador
2. Clique no botão "Ativar Lembretes" (flutuante ou Perfil)
3. Permita notificações no popup
4. ✅ Subscription será salva em `web_push_subscriptions`

### **Teste 2: Criar Hábito com Horário**
1. Crie um hábito (ex: "Beber água")
2. Configure horário (ex: "09:00")
3. Ative lembretes
4. ✅ Lembretes serão adicionados em `reminder_queue`

### **Teste 3: Verificar Fila**
Execute no Supabase:
```sql
SELECT * FROM reminder_queue WHERE sent = false;
```

### **Teste 4: Disparar Manualmente**
Execute no Supabase:
```sql
SELECT * FROM supabase_functions.http_request(
    'https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/send-reminders',
    'POST'
);
```

---

## 📝 Cron Job para Disparar Automaticamente

Para disparar **automaticamente** a Edge Function a cada minuto:

1. **Vá no Supabase Dashboard** → Database → Extensions
2. **Ative a extensão `pg_cron`** (se ainda não estiver)
3. **Crie um job**:

```sql
-- Criar job para rodar a Edge Function a cada minuto
SELECT cron.schedule(
    'send-reminders-every-minute',  -- Nome do job
    '* * * * *',                      -- A cada minuto
    $$
    SELECT net.http_post(
        url := 'https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/send-reminders',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.jwt_secret') || '"}'
    ) as request_id;
    $$
);
```

---

## 🐛 Troubleshooting

### **"Notificações não chegam no celular"**

✅ **Verificar**:
1. Subscription está salva? (`SELECT * FROM web_push_subscriptions;`)
2. Lembretes estão na fila? (`SELECT * FROM reminder_queue;`)
3. Edge Function está rodando? (Dashboard → Edge Functions → Logs)
4. Service Worker está registrado? (DevTools → Application → Service Workers)

### **"Permission denied"**

✅ **Solução**:
- Chrome: Permitir notificações em `chrome://settings/content/notifications`
- Safari: Settings → Sites → Notifications
- Adicionar site às exceções

### **"Subscription inválida" (410/404)**

✅ **Solução**:
- Subscription ficou inválida (app reinstalado, etc)
- O código já remove automaticamente subscriptions inválidas
- Usuário precisa reativar notificações

---

## 📊 Status Atual

- ✅ Banco de dados configurado
- ✅ Tabelas criadas (`web_push_subscriptions`, `reminder_queue`)
- ✅ Edge Function deployada
- ✅ Front-end registrando subscriptions
- ✅ Service Worker ouvindo pushes
- ⚠️ **Necessário**: Gerar chaves VAPID reais ou usar as de exemplo

---

## 🎯 Resultado Esperado

Quando tudo estiver configurado:

1. Usuário ativa notificações → Subscription salva
2. Usuário cria hábito com horário "09:00" → Lembrete agendado
3. Cron job roda a cada minuto → Edge Function disparada
4. Edge Function busca lembretes pendentes → Envia push
5. Service Worker recebe push → Mostra notificação 🔔
6. Usuário clica na notificação → App abre

**🚀 FUNCIONA MESMO COM APP FECHADO!**

---

**Última atualização**: 30 de Outubro de 2025  
**Status**: ✅ Pronto para produção (após configurar chaves VAPID)

