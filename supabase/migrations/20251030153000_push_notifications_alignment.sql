-- migration: align push notification storage with frontend expectations
-- purpose: rename push_subscriptions table, enforce rls, harden reminder_queue uniqueness
-- includes: table rename, rls policies for web push data, unique index for reminder queue, metadata comments

alter table public.push_subscriptions
    rename to web_push_subscriptions;

comment on table public.web_push_subscriptions is 'Stores Web Push subscriptions (endpoint + VAPID keys) per authenticated user.';

comment on column public.web_push_subscriptions.endpoint is 'Push service endpoint returned by PushManager.subscribe (unique per browser/device).';

comment on column public.web_push_subscriptions.keys is 'JSON object containing VAPID key material (p256dh/auth) required for encrypted payloads.';

comment on column public.web_push_subscriptions.user_id is 'User owning the push subscription; null when subscription was created before login.';

create index if not exists web_push_subscriptions_user_id_idx
    on public.web_push_subscriptions (user_id);

alter table public.web_push_subscriptions
    enable row level security;

create policy "web push subscriptions readable by owner"
    on public.web_push_subscriptions
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "web push subscriptions insert by owner"
    on public.web_push_subscriptions
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "web push subscriptions deletable by owner"
    on public.web_push_subscriptions
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);

comment on table public.reminder_queue is 'Queue of habit reminders scheduled for push delivery; processed by send-reminders edge function.';

create unique index if not exists reminder_queue_user_habit_schedule_key
    on public.reminder_queue (user_id, habit_id, scheduled_at);

alter table public.reminder_queue
    enable row level security;

create policy "reminder queue readable by owner"
    on public.reminder_queue
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "reminder queue insert by owner"
    on public.reminder_queue
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "reminder queue deletable by owner"
    on public.reminder_queue
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);

