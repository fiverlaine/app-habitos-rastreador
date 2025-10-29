# 🚀 Servidor de Push Notifications

Servidor backend Node.js para gerenciar notificações push do app de hábitos.

## 📦 Instalação

```bash
cd server
npm install
```

## 🔧 Configuração

Crie um arquivo `.env` na pasta `server/` com as seguintes variáveis:

```env
# Porta do servidor
PORT=5000

# URL do frontend (para CORS)
FRONTEND_URL=http://localhost:5173

# SUPABASE
SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# VAPID (Web Push) - Gere com: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
VAPID_SUBJECT=mailto:seu-email@exemplo.com

# SEGURANÇA
CRON_SECRET=um_secret_aleatorio_forte_aqui
```

## 🔑 Gerar Chaves VAPID

As chaves VAPID são necessárias para autenticar as notificações push:

```bash
npx web-push generate-vapid-keys
```

Copie as chaves geradas para o arquivo `.env`.

## ▶️ Executar

### Desenvolvimento (com auto-reload)
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📡 Endpoints Disponíveis

### `POST /api/subscribe`
Recebe e armazena subscription de push do frontend.

**Body:**
```json
{
  "userId": "uuid-do-usuario",
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### `POST /api/test-notification`
Envia uma notificação de teste para um usuário.

**Body:**
```json
{
  "userId": "uuid-do-usuario",
  "title": "Título da Notificação",
  "body": "Corpo da notificação"
}
```

### `POST /api/send-reminders`
Processa a fila de lembretes pendentes (chamado pela Edge Function).

**Body:**
```json
{
  "secret": "CRON_SECRET"
}
```

### `GET /api/health`
Verifica o status do servidor.

### `GET /api/vapid-public-key`
Retorna a chave pública VAPID para uso no frontend.

## 🚀 Deploy

Para deploy em produção, considere:

- **Vercel/Netlify Functions**: Converter para serverless functions
- **Railway/Render**: Deploy direto como Node.js app
- **Heroku**: Adicionar Procfile

## 📝 Notas

- O servidor usa `SERVICE_ROLE_KEY` do Supabase para acesso total às tabelas
- As subscriptions expiradas são automaticamente removidas quando detectadas
- Use HTTPS em produção (Web Push requer conexão segura)

