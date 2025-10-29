# ⚡ Início Rápido - Notificações Push

Este guia te leva do zero ao funcionamento em **15 minutos**!

## 🎯 Pré-requisitos

- Node.js instalado (v18+)
- Conta no Supabase
- Projeto já rodando localmente

---

## 🚀 5 Passos Rápidos

### 1️⃣ Gerar Chaves VAPID (2 min)

```bash
cd server
npm install
npx web-push generate-vapid-keys
```

📋 **Copie** as chaves que aparecem!

### 2️⃣ Configurar Backend (3 min)

Crie `server/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_sua_service_role_key

VAPID_PUBLIC_KEY=cole_aqui_a_chave_publica
VAPID_PRIVATE_KEY=cole_aqui_a_chave_privada
VAPID_SUBJECT=mailto:seu-email@exemplo.com

CRON_SECRET=qualquer_texto_secreto_aleatorio
```

**Onde pegar a Service Role Key?**
1. https://supabase.com/dashboard/project/jiohwtmymnizvwzyvdef/settings/api
2. Copie "service_role" (🔒 secreta)

### 3️⃣ Iniciar Backend (1 min)

```bash
# Na pasta server/
npm start
```

✅ Deve aparecer: `🚀 Servidor de Push Notifications - Rodando na porta: 5000`

### 4️⃣ Configurar Frontend (2 min)

Crie `.env.local` **na raiz do projeto**:

```env
VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_PUSH_SERVER_URL=http://localhost:5000
```

**Onde pegar a Anon Key?**
- Mesmo lugar da Service Role, mas pegue a "anon public"

### 5️⃣ Iniciar Frontend (1 min)

```bash
# Na raiz do projeto (não na pasta server)
npm run dev
```

---

## ✅ Testar (3 min)

1. Abra http://localhost:5173
2. Faça login
3. Clique no ícone de sino (🔔)
4. Clique "Ativar Notificações"
5. Permita quando o navegador perguntar
6. Clique "Enviar Notificação de Teste"

**💥 BOOM! Você deve receber uma notificação!**

---

## 🎯 Testar Lembrete de Hábito (3 min)

1. Crie ou edite um hábito
2. Ative o toggle "Lembretes"
3. Adicione um horário (ex: 2 minutos no futuro)
4. Salve
5. **Aguarde** o horário

⏰ Mas espere... a notificação **NÃO VAI CHEGAR** ainda! Por quê?

**Falta configurar a Edge Function que processa a fila!**

---

## ☁️ EXTRA: Configurar Edge Function (5 min)

### Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (Scoop)
scoop install supabase
```

### Deploy

```bash
supabase login
supabase link --project-ref jiohwtmymnizvwzyvdef
supabase functions deploy process-reminders
```

### Configurar Secrets

No Supabase Dashboard > Edge Functions > Secrets:

```
PUSH_SERVER_URL=http://localhost:5000
CRON_SECRET=o_mesmo_que_colocou_no_backend
```

### Configurar Cron

No Supabase > SQL Editor, execute:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

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

✅ Agora sim! Os lembretes serão enviados automaticamente a cada 5 minutos!

---

## 🐛 Problemas Comuns

### ❌ "Erro ao buscar chave VAPID"
- Verifique se o backend está rodando
- Teste: abra http://localhost:5000/api/health

### ❌ "Erro ao registrar subscription"
- Verifique a `SUPABASE_SERVICE_ROLE_KEY` no backend
- Certifique-se de que usou a **service_role**, não a anon

### ❌ Notificação de teste funciona, mas lembrete não chega
- A Edge Function está configurada?
- O cron job está ativo? Verifique: `SELECT * FROM cron.job;`

---

## 📖 Documentação Completa

Para mais detalhes, veja: `documentation/PUSH_NOTIFICATIONS_COMPLETE.md`

---

## 🎉 Pronto!

Agora você tem um sistema completo de notificações push funcionando!

**Estrutura de Arquivos Criados:**
```
app-habitos-rastreador/
├── server/                          ← Backend de push
│   ├── server.js                    ← Servidor principal
│   ├── package.json                 ← Dependências
│   └── .env                         ← Configurações (você cria)
├── supabase/functions/              
│   └── process-reminders/           ← Edge Function
│       └── index.ts
├── public/
│   └── sw.js                        ← Service Worker atualizado
├── hooks/
│   └── useNotifications.ts          ← Hook atualizado
├── index.tsx                        ← Registro do SW
└── .env.local                       ← Config do frontend (você cria)
```

**O que funciona agora:**
- ✅ Notificações de teste
- ✅ Lembretes programados de hábitos
- ✅ Push notifications nativas
- ✅ Funciona mesmo com app fechado
- ✅ Offline-first (PWA)

**Próximos passos:**
- Deploy em produção (Railway + Vercel)
- Configurar notificações de streak
- Adicionar notificações de conquistas

