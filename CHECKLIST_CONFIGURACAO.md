# ✅ Checklist de Configuração - Notificações Push

Use este checklist para garantir que tudo está funcionando corretamente!

---

## 🎯 FASE 1: Configuração do Backend (10 min)

### Passo 1: Preparar o Servidor
```bash
cd server
npm install
```
- [ ] Dependências instaladas sem erros
- [ ] Pasta `node_modules` criada

### Passo 2: Gerar Chaves VAPID
```bash
npx web-push generate-vapid-keys
```
- [ ] Public Key gerada (começa com "B...")
- [ ] Private Key gerada
- [ ] **IMPORTANTE:** Copiei e guardei ambas as chaves

### Passo 3: Criar arquivo .env
Crie `server/.env` com:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
SUPABASE_SERVICE_ROLE_KEY=cole_aqui
VAPID_PUBLIC_KEY=cole_aqui
VAPID_PRIVATE_KEY=cole_aqui
VAPID_SUBJECT=mailto:seu-email@exemplo.com
CRON_SECRET=qualquer_texto_secreto
```

- [ ] Arquivo `.env` criado em `server/.env`
- [ ] Service Role Key obtida do Supabase
- [ ] Todas as chaves VAPID coladas
- [ ] Email configurado no VAPID_SUBJECT

### Passo 4: Iniciar o Backend
```bash
npm start
```

- [ ] Servidor iniciou sem erros
- [ ] Mensagem "🚀 Servidor de Push Notifications" apareceu
- [ ] Porta 5000 está ativa
- [ ] VAPID Public Key aparece no log

### Passo 5: Testar Backend
Abra em outra aba do terminal:
```bash
curl http://localhost:5000/api/health
```

- [ ] Retornou `{"status":"ok"}`
- [ ] Backend está respondendo

---

## 🌐 FASE 2: Configuração do Frontend (3 min)

### Passo 6: Criar .env.local
Crie `.env.local` **na raiz do projeto** (não na pasta server):
```env
VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_PUSH_SERVER_URL=http://localhost:5000
```

- [ ] Arquivo `.env.local` criado na raiz
- [ ] Anon Key obtida do Supabase
- [ ] URL do backend configurada

### Passo 7: Iniciar Frontend
```bash
npm run dev
```

- [ ] Vite iniciou sem erros
- [ ] App abrindo em http://localhost:5173
- [ ] Não há erros no console do navegador

### Passo 8: Verificar Console
Abra o DevTools (F12) e verifique:

- [ ] Mensagem "✅ Service Worker registrado com sucesso"
- [ ] Mensagem "✅ Chave VAPID pública carregada"
- [ ] Não há erros vermelhos

---

## 🧪 FASE 3: Testar Notificações (5 min)

### Passo 9: Fazer Login
- [ ] Consegui fazer login/criar conta
- [ ] Dashboard carregou normalmente

### Passo 10: Ativar Notificações
1. Clique no ícone de sino 🔔 (canto inferior direito)
2. Clique em "Ativar Notificações"
3. Quando o navegador perguntar, clique "Permitir"

- [ ] Popup de permissão apareceu
- [ ] Cliquei em "Permitir"
- [ ] Status mudou para "Notificações Ativadas" ✅

### Passo 11: Testar Notificação
1. No modal de configurações, clique "Enviar Notificação de Teste"

- [ ] Botão ficou verde com "✅ Notificação Enviada!"
- [ ] **Recebi a notificação no sistema!** 🎉
- [ ] Ao clicar na notificação, o app abriu/focou

### Passo 12: Verificar Banco de Dados
No Supabase, vá em **Table Editor** > `push_subscriptions`:

- [ ] Há pelo menos 1 registro na tabela
- [ ] O `user_id` corresponde ao meu usuário
- [ ] O `endpoint` não está vazio

---

## ☁️ FASE 4: Configurar Edge Function (Opcional, mas recomendado)

### Passo 13: Instalar Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop install supabase
```

- [ ] CLI instalado
- [ ] Comando `supabase --version` funciona

### Passo 14: Login e Deploy
```bash
supabase login
supabase link --project-ref jiohwtmymnizvwzyvdef
supabase functions deploy process-reminders
```

- [ ] Login realizado com sucesso
- [ ] Projeto linkado
- [ ] Edge Function deployed

### Passo 15: Configurar Secrets
No Supabase Dashboard > Edge Functions > Secrets:

Adicione:
- `PUSH_SERVER_URL` = `http://localhost:5000` (ou URL de produção)
- `CRON_SECRET` = (mesmo valor do backend)

- [ ] Secrets configurados
- [ ] Valores conferidos

### Passo 16: Configurar Cron Job
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

- [ ] SQL executado sem erros
- [ ] Verificado com: `SELECT * FROM cron.job;`
- [ ] Job aparece na lista

---

## 🎯 FASE 5: Testar Lembrete de Hábito (10 min)

### Passo 17: Criar Hábito com Lembrete
1. Clique no botão "+" para adicionar hábito
2. Preencha nome, ícone, etc
3. **Ative o toggle "Lembretes"**
4. Clique em "Adicionar Horário"
5. Configure um horário **3 minutos no futuro**
6. Salve o hábito

- [ ] Hábito criado com sucesso
- [ ] Lembretes estão ativados (toggle verde)
- [ ] Horário aparece no card do hábito

### Passo 18: Verificar Fila
No Supabase > Table Editor > `reminder_queue`:

- [ ] Há um registro com `sent = false`
- [ ] O `habit_id` corresponde ao hábito criado
- [ ] O `scheduled_at` é o horário futuro configurado

### Passo 19: Aguardar Notificação
Aguarde até 10 minutos (cron roda a cada 5 min + processamento)

- [ ] **Recebi a notificação no horário!** 🎉
- [ ] A notificação mostra o nome do hábito
- [ ] Cliquei e o app abriu

### Passo 20: Verificar Processamento
No Supabase > Table Editor > `reminder_queue`:

- [ ] O registro agora tem `sent = true`
- [ ] Não há mais lembretes pendentes para o horário passado

---

## 🎉 CONCLUSÃO

Se você marcou **TODOS** os itens acima, parabéns! 🎊

**Seu sistema de notificações push está 100% funcional!**

### O que você conseguiu:
- ✅ Backend rodando e enviando push
- ✅ Frontend recebendo notificações
- ✅ Service Worker operacional
- ✅ Edge Function processando lembretes
- ✅ Cron job agendando automaticamente
- ✅ Banco de dados sincronizado

---

## ❌ Se Algo Não Funcionou

### Problema: Backend não inicia
**Solução:**
1. Verifique se todas as variáveis do `.env` estão corretas
2. Confirme que a porta 5000 não está em uso
3. Veja os logs de erro no terminal

### Problema: Notificação de teste não chega
**Solução:**
1. Verifique se concedeu permissão no navegador
2. Veja o Console (F12) para erros
3. Confirme que o backend está rodando
4. Teste o health check: `curl http://localhost:5000/api/health`

### Problema: Service Worker não registra
**Solução:**
1. Limpe o cache (Ctrl+Shift+R)
2. Desregistre SW antigos:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(regs => 
     regs.forEach(reg => reg.unregister())
   )
   ```
3. Recarregue a página

### Problema: Lembrete não chega no horário
**Solução:**
1. Verifique se a Edge Function foi deployed
2. Confirme que o cron job está ativo: `SELECT * FROM cron.job;`
3. Veja os logs da Edge Function no Dashboard
4. Teste manualmente:
   ```bash
   curl -X POST https://...supabase.co/functions/v1/process-reminders \
     -H "Authorization: Bearer SECRET"
   ```

---

## 📖 Documentação Adicional

Se precisar de mais detalhes:
- **Setup Rápido**: `SETUP_PUSH_NOTIFICACOES.md`
- **Guia Completo**: `documentation/PUSH_NOTIFICATIONS_COMPLETE.md`
- **Comandos**: `COMANDOS_RAPIDOS.md`
- **Troubleshooting**: Ver guia completo

---

## 📊 Seu Progresso

**Fase 1 - Backend:** [ ] Completo  
**Fase 2 - Frontend:** [ ] Completo  
**Fase 3 - Testes:** [ ] Completo  
**Fase 4 - Edge Function:** [ ] Completo  
**Fase 5 - Lembrete:** [ ] Completo  

**Status Geral:** ___% Completo

---

**🎯 Última atualização:** Outubro 2025  
**📱 Versão:** 1.0  
**✅ Itens no checklist:** 20

**💡 Dica:** Imprima este checklist ou marque digitalmente enquanto configura!

