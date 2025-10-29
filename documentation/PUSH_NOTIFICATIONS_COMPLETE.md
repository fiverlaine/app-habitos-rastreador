# 🔔 Guia Completo de Notificações Push - App de Hábitos

Este guia detalha **passo a passo** como configurar e utilizar o sistema completo de notificações push do app de hábitos.

## 📐 Arquitetura do Sistema

O sistema de notificações push é composto por **4 componentes principais**:

```
┌─────────────────┐
│   1. FRONTEND   │ ──> Solicita permissão e registra subscription
│   (React PWA)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. SERVICE      │ ──> Escuta eventos push e exibe notificações
│    WORKER       │
└─────────────────┘
         ▲
         │
┌────────┴────────┐
│ 3. BACKEND      │ ──> Envia notificações push via Web Push API
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. EDGE         │ ──> Processa fila de lembretes (cron job)
│   FUNCTION      │
└─────────────────┘
```

---

## 🚀 PASSO 1: Configurar Backend de Push

### 1.1 Instalar Dependências

```bash
cd server
npm install
```

### 1.2 Gerar Chaves VAPID

As chaves VAPID são necessárias para autenticar as notificações push:

```bash
npx web-push generate-vapid-keys
```

**Resultado esperado:**
```
=======================================
Public Key:
BKxT5c...sua_chave_publica...XYZ

Private Key:
abc123...sua_chave_privada...789
=======================================
```

⚠️ **IMPORTANTE:** Guarde essas chaves em um local seguro!

### 1.3 Criar Arquivo .env

Crie o arquivo `server/.env` com:

```env
# Porta do servidor
PORT=5000

# URL do frontend (para CORS)
FRONTEND_URL=http://localhost:5173

# ========================================
# SUPABASE
# ========================================
SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# ========================================
# VAPID (Web Push) - Cole as chaves geradas acima
# ========================================
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
VAPID_SUBJECT=mailto:seu-email@exemplo.com

# ========================================
# SEGURANÇA
# ========================================
# Gere um secret forte: openssl rand -base64 32
CRON_SECRET=seu_secret_aleatorio_forte_aqui
```

### 1.4 Obter Service Role Key do Supabase

1. Acesse: https://supabase.com/dashboard/project/jiohwtmymnizvwzyvdef/settings/api
2. Copie a **service_role key** (⚠️ Não compartilhe esta chave!)
3. Cole no `SUPABASE_SERVICE_ROLE_KEY` do arquivo `.env`

### 1.5 Iniciar o Servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

✅ Verifique se aparece:
```
========================================
🚀 Servidor de Push Notifications
========================================
📡 Rodando na porta: 5000
🌐 Frontend: http://localhost:5173
🔐 VAPID Public Key: BKxT5c...
========================================
```

---

## 🌐 PASSO 2: Configurar Frontend

### 2.1 Criar Arquivo .env.local

Crie o arquivo `.env.local` na **raiz do projeto** (não na pasta server):

```env
# Supabase
VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Backend de Push Notifications
VITE_PUSH_SERVER_URL=http://localhost:5000
```

### 2.2 Iniciar o Frontend

```bash
# Na raiz do projeto (não na pasta server)
npm run dev
```

O app estará disponível em: http://localhost:5173

---

## ☁️ PASSO 3: Configurar Supabase Edge Function

### 3.1 Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### 3.2 Fazer Login e Link do Projeto

```bash
# Login no Supabase
supabase login

# Link do projeto
supabase link --project-ref jiohwtmymnizvwzyvdef
```

### 3.3 Configurar Secrets da Edge Function

No Supabase Dashboard, vá em **Edge Functions > Secrets** e adicione:

```
PUSH_SERVER_URL=http://seu-backend-em-producao.com
CRON_SECRET=o_mesmo_secret_do_backend
```

⚠️ **ATENÇÃO:** Em produção, use a URL pública do seu backend (ex: Railway, Render, Vercel).

### 3.4 Deploy da Edge Function

```bash
supabase functions deploy process-reminders
```

### 3.5 Configurar Cron Job

No Supabase Dashboard, vá em **SQL Editor** e execute:

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Criar job que processa lembretes a cada 5 minutos
SELECT cron.schedule(
  'process-reminders-job',
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

-- Verificar se o job foi criado
SELECT * FROM cron.job;
```

---

## 🧪 PASSO 4: Testar o Sistema

### 4.1 Teste de Permissão e Subscription

1. Abra o app: http://localhost:5173
2. Faça login
3. Clique no botão de notificações (ícone de sino)
4. Clique em "Ativar Notificações"
5. Permita as notificações quando o navegador solicitar
6. Clique em "Enviar Notificação de Teste"

✅ **Esperado:** Você deve receber uma notificação push!

### 4.2 Teste de Lembrete de Hábito

1. Crie ou edite um hábito
2. Ative "Lembretes" (toggle)
3. Configure um horário (ex: 2 minutos no futuro)
4. Salve o hábito
5. Aguarde o horário configurado

✅ **Esperado:** Você receberá uma notificação push no horário configurado!

### 4.3 Verificar Logs

**Backend:**
```bash
# No terminal onde o servidor está rodando, você verá:
✅ Subscription salva para usuário: abc-123
📬 Processando 1 lembretes...
✅ Lembrete enviado: Beber Água para usuário abc-123
```

**Edge Function:**
- Acesse: Supabase Dashboard > Edge Functions > process-reminders > Logs

**Frontend:**
- Abra o Console do navegador (F12) e veja:
```
✅ Service Worker registrado com sucesso
✅ Chave VAPID pública carregada
📬 Push notification recebida
```

---

## 🚢 PASSO 5: Deploy em Produção

### 5.1 Deploy do Backend

Escolha uma plataforma:

#### **Opção A: Railway**
1. Acesse https://railway.app
2. Crie novo projeto
3. Conecte seu repositório
4. Configure as variáveis de ambiente (todas do .env)
5. Deploy automático!

#### **Opção B: Render**
1. Acesse https://render.com
2. New > Web Service
3. Conecte seu repositório
4. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
5. Adicione variáveis de ambiente

#### **Opção C: Heroku**
1. `heroku create seu-app-push-server`
2. `heroku config:set VAPID_PUBLIC_KEY=...` (todas as variáveis)
3. `git push heroku main`

### 5.2 Deploy do Frontend (Vercel)

1. Conecte seu repositório no Vercel
2. Configure variáveis de ambiente:
   ```
   VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_anon_key
   VITE_PUSH_SERVER_URL=https://seu-backend-em-producao.com
   ```
3. Deploy automático!

### 5.3 Atualizar Edge Function

```bash
# Atualizar secret com URL de produção
supabase secrets set PUSH_SERVER_URL=https://seu-backend-em-producao.com

# Re-deploy
supabase functions deploy process-reminders
```

---

## 🔧 Troubleshooting

### ❌ "Chave VAPID não carregada"
**Causa:** Backend não está rodando ou URL incorreta  
**Solução:** 
1. Verifique se o backend está rodando em `http://localhost:5000`
2. Teste: `curl http://localhost:5000/api/health`
3. Verifique a variável `VITE_PUSH_SERVER_URL` no `.env.local`

### ❌ "Erro ao registrar subscription no servidor"
**Causa:** Backend não consegue salvar no Supabase  
**Solução:**
1. Verifique o `SUPABASE_SERVICE_ROLE_KEY` no backend
2. Verifique se a tabela `push_subscriptions` existe
3. Veja os logs do backend para mais detalhes

### ❌ "Notificação não chega no horário configurado"
**Causa:** Cron job não está rodando ou Edge Function com erro  
**Solução:**
1. Verifique os logs da Edge Function no Supabase
2. Teste manualmente: `curl -X POST https://...supabase.co/functions/v1/process-reminders -H "Authorization: Bearer SECRET"`
3. Verifique se o job está ativo: `SELECT * FROM cron.job;`

### ❌ Service Worker não registra
**Causa:** HTTPS necessário em produção  
**Solução:**
1. Em desenvolvimento, use `localhost` (funciona sem HTTPS)
2. Em produção, **OBRIGATÓRIO** usar HTTPS
3. Vercel/Netlify já fornecem HTTPS automaticamente

---

## 📊 Monitoramento

### Verificar Subscriptions Ativas
```sql
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(DISTINCT user_id) as unique_users
FROM push_subscriptions;
```

### Verificar Lembretes Pendentes
```sql
SELECT 
    COUNT(*) as pendentes,
    MIN(scheduled_at) as proximo_lembrete
FROM reminder_queue
WHERE sent = false;
```

### Verificar Taxa de Sucesso
```sql
SELECT 
    sent,
    COUNT(*) as total
FROM reminder_queue
GROUP BY sent;
```

---

## 🎯 Resumo de Comandos Rápidos

```bash
# BACKEND
cd server
npm install
npx web-push generate-vapid-keys
# (criar .env com as chaves)
npm run dev

# FRONTEND
cd ..
npm run dev

# EDGE FUNCTION
supabase login
supabase link --project-ref jiohwtmymnizvwzyvdef
supabase functions deploy process-reminders
```

---

## 📚 Recursos Adicionais

- **Web Push API**: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **web-push library**: https://github.com/web-push-libs/web-push

---

## ✅ Checklist de Configuração

- [ ] Backend rodando com VAPID keys configuradas
- [ ] Frontend conectado ao backend
- [ ] Service Worker registrado (verificar no console)
- [ ] Permissão de notificação concedida
- [ ] Subscription salva no banco (verificar tabela `push_subscriptions`)
- [ ] Edge Function deployed
- [ ] Cron job configurado e ativo
- [ ] Teste de notificação funcionando
- [ ] Teste de lembrete de hábito funcionando

---

**🎉 Parabéns! Seu sistema de notificações push está completo e funcionando!**

Para dúvidas ou problemas, verifique os logs em cada componente (Frontend Console, Backend Terminal, Edge Function Logs).

