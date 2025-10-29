# ⚡ Comandos Rápidos - Notificações Push

Comandos essenciais para configurar e gerenciar o sistema de push notifications.

## 🚀 Configuração Inicial

### Backend

```bash
# Entrar na pasta do servidor
cd server

# Instalar dependências
npm install

# Gerar chaves VAPID (copie as chaves!)
npx web-push generate-vapid-keys

# OU usar o script assistente (recomendado)
npm run setup

# Iniciar servidor
npm start

# Desenvolvimento (auto-reload)
npm run dev
```

### Frontend

```bash
# Na raiz do projeto
npm install
npm run dev
```

## ☁️ Supabase Edge Function

```bash
# Instalar CLI (macOS)
brew install supabase/tap/supabase

# Login
supabase login

# Link do projeto
supabase link --project-ref jiohwtmymnizvwzyvdef

# Deploy da função
supabase functions deploy process-reminders

# Ver logs
supabase functions logs process-reminders
```

## 🧪 Testes

### Testar Backend

```bash
# Health check
curl http://localhost:5000/api/health

# Obter chave VAPID pública
curl http://localhost:5000/api/vapid-public-key

# Testar notificação (substitua USER_ID)
curl -X POST http://localhost:5000/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"userId":"SEU_USER_ID","title":"Teste","body":"Funcionou!"}'
```

### Testar Edge Function

```bash
# Testar manualmente (substitua SECRET)
curl -X POST https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/process-reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

## 🗄️ Queries SQL Úteis

### Verificar Subscriptions

```sql
-- Total de subscriptions por usuário
SELECT 
    user_id,
    COUNT(*) as num_devices
FROM push_subscriptions
GROUP BY user_id;

-- Subscriptions ativas
SELECT * FROM push_subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

### Verificar Fila de Lembretes

```sql
-- Lembretes pendentes
SELECT 
    rq.*,
    h.name as habit_name
FROM reminder_queue rq
JOIN habits h ON h.id = rq.habit_id
WHERE rq.sent = false
ORDER BY rq.scheduled_at ASC;

-- Limpar fila (caso necessário)
DELETE FROM reminder_queue WHERE sent = true;
```

### Gerenciar Cron Job

```sql
-- Ver jobs ativos
SELECT * FROM cron.job;

-- Remover job (se necessário)
SELECT cron.unschedule('process-reminders-job');

-- Criar/recriar job
SELECT cron.schedule(
  'process-reminders-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://jiohwtmymnizvwzyvdef.supabase.co/functions/v1/process-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SEU_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## 📊 Monitoramento

### Logs do Backend

```bash
# Servidor local
# Os logs aparecem no terminal onde você rodou npm start

# Em produção (Railway)
railway logs

# Em produção (Heroku)
heroku logs --tail
```

### Logs do Frontend

```javascript
// No Console do Navegador (F12)

// Ver Service Worker
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))

// Ver subscription
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => console.log(sub))
)

// Verificar permissão
console.log(Notification.permission)
```

### Logs da Edge Function

```bash
# Via CLI
supabase functions logs process-reminders --follow

# Via Dashboard
# https://supabase.com/dashboard/project/jiohwtmymnizvwzyvdef/functions/process-reminders/logs
```

## 🐛 Troubleshooting Rápido

### Backend não inicia

```bash
# Verificar se há outro processo na porta 5000
lsof -i :5000

# Matar processo (macOS/Linux)
kill -9 $(lsof -t -i:5000)

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Service Worker não atualiza

```javascript
// No Console do Navegador
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})

// Depois recarregue: Ctrl+Shift+R (hard reload)
```

### Limpar dados de teste

```sql
-- Remover todas as subscriptions de um usuário
DELETE FROM push_subscriptions WHERE user_id = 'SEU_USER_ID';

-- Limpar fila de lembretes
DELETE FROM reminder_queue;
```

## 🔧 Variáveis de Ambiente

### Backend (.env)

```bash
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VAPID_PUBLIC_KEY=BKx...
VAPID_PRIVATE_KEY=abc...
VAPID_SUBJECT=mailto:email@exemplo.com
CRON_SECRET=random_secret_123
```

### Frontend (.env.local)

```bash
VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_PUSH_SERVER_URL=http://localhost:5000
```

### Edge Function (Supabase Secrets)

```bash
PUSH_SERVER_URL=https://seu-backend.railway.app
CRON_SECRET=mesmo_do_backend
```

## 📦 Deploy

### Backend - Railway

```bash
# Login
railway login

# Criar projeto
railway init

# Deploy
railway up

# Configurar variáveis
railway variables set VAPID_PUBLIC_KEY=...
```

### Frontend - Vercel

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Produção
vercel --prod
```

## 🎯 Checklist de Verificação

```bash
# ✅ Backend rodando
curl http://localhost:5000/api/health

# ✅ VAPID configurado
curl http://localhost:5000/api/vapid-public-key

# ✅ Frontend conectado
# Abra http://localhost:5173 e veja console

# ✅ Service Worker registrado
# Console: navigator.serviceWorker.controller

# ✅ Permissão concedida
# Console: Notification.permission === "granted"

# ✅ Subscription criada
# Verifique tabela push_subscriptions

# ✅ Edge Function deployed
supabase functions list

# ✅ Cron job ativo
# SQL: SELECT * FROM cron.job;
```

## 🆘 Ajuda Rápida

- **Documentação completa**: `documentation/PUSH_NOTIFICATIONS_COMPLETE.md`
- **Início rápido**: `SETUP_PUSH_NOTIFICACOES.md`
- **Issues do GitHub**: [Criar issue](https://github.com/SEU_REPO/issues)

---

**💡 Dica:** Adicione este arquivo aos favoritos para consulta rápida!

