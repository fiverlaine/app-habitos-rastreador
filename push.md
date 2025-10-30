# Push notifications em projetos React com Supabase (guia completo)

> Este guia cobre **React Native (Expo)**, **React Web (PWA/Web Push)** e **integrações prontas (OneSignal)**. Inclui arquitetura, tabelas, RLS, Edge Functions (Deno), snippets de cliente e dicas de produção.

---

## Sumário

* [Visão geral & decisões de arquitetura](#visão-geral--decisões-de-arquitetura)
* [Caminhos possíveis](#caminhos-possíveis)

  * [1) React Native (Expo) + Supabase Edge Functions](#1-react-native-expo--supabase-edge-functions)
  * [2) React Web (PWA) + Web Push (VAPID) + Edge Function](#2-react-web-pwa--web-push-vapid--edge-function)
  * [3) OneSignal + Supabase (rápido para escalar)](#3-onesignal--supabase-rápido-para-escalar)
* [Implementação detalhada](#implementação-detalhada)

  * [A) React Native (Expo)](#a-react-native-expo)
  * [B) React Web (PWA) com Web Push (VAPID)](#b-react-web-pwa-com-web-push-vapid)
  * [C) Integração OneSignal + Supabase](#c-integração-onesignal--supabase)
* [Modelo de dados (SQL), RLS e Webhooks](#modelo-de-dados-sql-rls-e-webhooks)
* [Limpeza de tokens inválidos (cron)](#limpeza-de-tokens-inválidos-cron)
* [Testes manuais (cURL/Postman)](#testes-manuais-curlpostman)
* [Pegadinhas e boas práticas](#pegadinhas-e-boas-práticas)
* [Projetos/exemplos para clonar](#projetosexemplos-para-clonar)
* [Checklist de produção](#checklist-de-produção)

---

## Visão geral & decisões de arquitetura

**Fluxo comum** (independente de plataforma):

1. **Capturar o identificador de push do cliente**

   * Expo (RN): *Expo Push Token* por dispositivo.
   * Web (PWA): objeto **PushSubscription** (endpoint + chaves p256dh/auth) com **VAPID**.
2. **Persistir** no Postgres do Supabase (tabelas dedicadas) com **RLS** habilitado.
3. **Disparo** por **Supabase Edge Function** (Deno) chamada:

   * Diretamente por HTTP (ex.: painel/admin) **ou**
   * Automaticamente via **Database Webhook** ao inserir um registro em `notifications`.
4. **Observabilidade**: logar respostas de envio, tratar erros e limpar tokens inválidos.

---

## Caminhos possíveis

### 1) React Native (Expo) + Supabase Edge Functions

* App coleta token via **Expo Notifications**.
* Salva em `device_tokens` (user_id, expo_token, metadata).
* **Edge Function** chama o **Expo Push Service** (`https://exp.host/--/api/v2/push/send`).
* Opcional: **Webhook do Banco** dispara a função quando há novo `INSERT` em `notifications`.

### 2) React Web (PWA) + Web Push (VAPID) + Edge Function

* Navegador registra **Service Worker** e assina **Push API** (gera `PushSubscription`).
* Salva assinatura em `web_push_subscriptions`.
* **Edge Function** envia Web Push usando VAPID (chaves públicas/privadas) com lib compatível com Deno.

### 3) OneSignal + Supabase (rápido para escalar)

* Usar OneSignal para canais Web + Mobile (segmentação, analytics, in-app).
* Disparos podem ser orquestrados por **Edge Functions** e **Database Webhooks**.

---

## Implementação detalhada

### A) React Native (Expo)

**Cliente (Expo) – registrar token e salvar no Supabase**

```ts
// app/registerPush.ts
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

export async function registerForPushAsync(userId: string) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data;

  await supabase.from('device_tokens')
    .upsert({ user_id: userId, expo_token: token });
}
```

**Servidor (Edge Function) – envio via Expo Push Service**

```ts
// supabase/functions/send-push/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

type Payload = {
  title: string;
  body?: string;
  tokens: string[]; // expo tokens
};

Deno.serve(async (req) => {
  const { title, body, tokens } = await req.json() as Payload;

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(tokens.map((to) => ({ to, title, body, sound: 'default' }))),
  });

  const text = await res.text();
  return new Response(text, { status: res.status });
});
```

**Automatizar com Webhook do Banco**

* Tabela `notifications` (quem, o quê enviar, payload).
* Database Webhook **POST** → `send-push` ao criar um `notification`.

**Notas Expo**

* iOS exige APNs configurado no projeto EAS.
* Em produção, trate os receipts retornados pelo Expo Push para limpar tokens inválidos.

---

### B) React Web (PWA) com Web Push (VAPID)

**1) Conceito**

* **Service Worker** recebe o `push` e exibe a Notification.
* O cliente assina via `PushManager.subscribe(...)` com a **public VAPID key**.
* O servidor (Edge Function) envia para o `endpoint` da assinatura, autenticado por **VAPID**.

**2) Front-end (React) – registrar SW e assinar**

```ts
// src/push.ts
export async function subscribeToPush(publicVapidKeyBase64: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  const reg = await navigator.serviceWorker.register('/sw.js');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return null;

  const key = Uint8Array.from(atob(publicVapidKeyBase64), c => c.charCodeAt(0));

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });

  // Envie para o Supabase
  // const { data, error } = await supabase.from('web_push_subscriptions')
  //   .upsert({ user_id, ...sub.toJSON() })
  return sub;
}
```

**3) Service Worker simples (`/public/sw.js`)**

```js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(self.registration.showNotification(data.title || 'Notificação', {
    body: data.body || '',
    data
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
```

**4) Edge Function (Deno) – enviando Web Push com VAPID**

```ts
// deno.json
// {
//   "imports": { "@negrel/webpush": "jsr:@negrel/webpush@^0.4" }
// }

// supabase/functions/webpush/index.ts
import * as webpush from '@negrel/webpush';

const VAPID_SUBJECT = 'mailto:dev@suaapp.com';
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE')!;
webpush.importVapidKeys({ publicKey: VAPID_PUBLIC, privateKey: VAPID_PRIVATE });

type Body = { subscription: any; payload: Record<string, unknown> };

Deno.serve(async (req) => {
  const { subscription, payload } = await req.json() as Body;
  await webpush.send(subscription, JSON.stringify(payload), { subject: VAPID_SUBJECT });
  return new Response('ok');
});
```

**Geração de VAPID keys**

* Gere uma vez localmente (Node ou Deno) e salve em **Project Secrets** do Supabase (`VAPID_PUBLIC`, `VAPID_PRIVATE`).

**Compatibilidade**

* iOS: Web Push só funciona em **PWAs instaladas** (iOS 16.4+), com permissão explícita do usuário.

---

### C) Integração OneSignal + Supabase

**Quando usar**: quer velocidade, segmentação, analytics e suporte a múltiplos canais (Web + Mobile) sem manter toda a camada de envio.

**Passos**

1. Criar app no OneSignal; obter **App ID** e **REST API Key**.
2. No Supabase, salvar as chaves como **Secrets**.
3. Edge Function faz POST para o endpoint do OneSignal para criar notificações.

**Exemplo (Edge Function)**

```ts
// supabase/functions/onesignal/index.ts
const APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!;
const API_KEY = Deno.env.get('ONESIGNAL_REST_KEY')!;

Deno.serve(async (req) => {
  const { title, body, segments = ['All'] } = await req.json();
  const res = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Basic ${API_KEY}`,
    },
    body: JSON.stringify({
      app_id: APP_ID,
      headings: { en: title },
      contents: { en: body },
      included_segments: segments,
    }),
  });
  return new Response(await res.text(), { status: res.status });
});
```

---

## Modelo de dados (SQL), RLS e Webhooks

**Tabelas**

```sql
-- Tokens de dispositivos (Expo / Mobile)
create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  expo_token text not null,
  platform text check (platform in ('ios','android')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on public.device_tokens(user_id);

-- Assinaturas Web Push (PWA)
create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);
create index on public.web_push_subscriptions(user_id);

-- Fila de notificações (dispara via webhook)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  body text,
  url text,
  audience text default 'single', -- 'single' | 'all' | 'segment'
  segment text,
  created_at timestamptz default now()
);
```

**RLS (exemplos mínimos – ajuste às suas regras)**

```sql
alter table public.device_tokens enable row level security;
alter table public.web_push_subscriptions enable row level security;
alter table public.notifications enable row level security;

-- Dono gerencia seus próprios tokens/assinaturas
create policy "device_tokens_owner_rw" on public.device_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "web_push_owner_rw" on public.web_push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notificações: permitir INSERT pelo app (ex.: para solicitar envio para si mesmo)
create policy "notifications_insert_auth" on public.notifications
  for insert with check (auth.role() = 'authenticated');

-- Opcional: uma role de serviço (service_role) pode ler tudo para o worker
```

**Webhook do Banco**

* Configure no painel do Supabase um **Database Webhook** para a tabela `notifications` (evento `INSERT`) apontando para `https://<PROJECT>.functions.supabase.co/send-push` (mobile) ou `.../webpush` (web), conforme sua estratégia.
* No handler (Edge Function), resolva o público (`audience`):

  * `single`: buscar tokens/assinaturas do `user_id` informado.
  * `all`: enviar para todos.
  * `segment`: filtrar por segmentações salvas por você.

---

## Limpeza de tokens inválidos (cron)

* Agende uma **Edge Function** (cron) diária/semanal para:

  * Validar tokens/assinaturas recém-falhadas.
  * Remover registros com erro permanente (ex.: 404/410 para Web Push; receipts inválidos no Expo).
* Mantenha uma tabela `push_failures` para análise e reprocessamento.

---

## Testes manuais (cURL/Postman)

**Expo (mobile)**

```bash
curl -X POST \
  https://<PROJECT>.functions.supabase.co/send-push \
  -H 'authorization: Bearer <ANON_OR_SERVICE_KEY>' \
  -H 'content-type: application/json' \
  -d '{
    "title": "Hello",
    "body": "Test from curl",
    "tokens": ["ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"]
  }'
```

**Web Push (PWA)**

```bash
curl -X POST \
  https://<PROJECT>.functions.supabase.co/webpush \
  -H 'authorization: Bearer <ANON_OR_SERVICE_KEY>' \
  -H 'content-type: application/json' \
  -d '{
    "subscription": { "endpoint": "https://fcm.googleapis.com/fcm/send/...", "keys": { "p256dh": "...", "auth": "..." } },
    "payload": { "title": "Hello", "body": "From curl", "url": "/inbox" }
  }'
```

---

## Pegadinhas e boas práticas

* **Webhook do Banco > Trigger SQL** para chamar Edge Functions (menos acoplamento e melhor observabilidade).
* **RLS**: não exponha tokens/assinaturas de outros usuários.
* **iOS (Web Push)**: apenas em PWAs instaladas e com permissão explícita.
* **Consentimento**: sempre peça permissão de notificação no contexto certo (ação do usuário) e explique o valor.
* **Higiene**: limpe tokens/assinaturas inválidos e registre métricas de entrega.
* **Secrets**: guarde chaves (VAPID/OneSignal) via **Project Secrets** do Supabase.
* **Retentativas**: implemente backoff exponencial para falhas temporárias.

---

## Projetos/exemplos para clonar

* **React Native (Expo) + Supabase**: repositórios exemplificando push via Expo e backend no Supabase.
* **OneSignal + Supabase**: exemplos oficiais de integração (Edge Function + webhooks, Next.js app de amostra).
* **PWA Web Push (VAPID)**: exemplos com Service Worker, `PushManager.subscribe()` e servidor Deno/Node.

> Dica: pesquise por termos como *expo push notifications supabase*, *supabase web push deno vapid*, *onesignal supabase sample* nos repositórios públicos para encontrar templates atualizados.

---

## Checklist de produção

* [ ] Definir estratégia: **Expo** (mobile), **PWA Web Push** (web) ou **OneSignal** (rápida/omnichannel).
* [ ] Criar tabelas (`device_tokens`, `web_push_subscriptions`, `notifications`).
* [ ] Escrever políticas **RLS** minimamente restritivas.
* [ ] Implementar **Edge Functions** de envio (Expo/WebPush/OneSignal).
* [ ] Configurar **Database Webhook** → função de envio.
* [ ] Armazenar **Secrets** (VAPID, chaves REST, etc.).
* [ ] Implementar coleta de token/assinatura no cliente + persistência no Supabase.
* [ ] Implementar tela de **opt-in** com explicação do valor.
* [ ] Testes end-to-end (dispositivo real, navegadores principais).
* [ ] Agendar **cron** para limpeza de tokens e métricas.

---

> Quer que eu gere um **esqueleto** do seu caso (Expo ou PWA) com as tabelas, políticas e Edge Function já prontas? Me diga qual stack (Expo/React Native ou Next.js/PWA) e o naming que você prefere para as tabelas/funções.
