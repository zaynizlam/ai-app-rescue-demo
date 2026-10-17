-- Turn Row Level Security back on: each user can only touch their own rows.
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- Tasks: full access to your own tasks only
create policy "Users read own tasks" on public.tasks
  for select using ((select auth.uid()) = user_id);

create policy "Users create own tasks" on public.tasks
  for insert with check ((select auth.uid()) = user_id);

create policy "Users update own tasks" on public.tasks
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users delete own tasks" on public.tasks
  for delete using ((select auth.uid()) = user_id);

-- Profiles: users can read their own profile but NOT update it.
-- The plan column is changed only by the Stripe webhook (service role),
-- so nobody can upgrade themselves to Pro from the browser.
create policy "Users read own profile" on public.profiles
  for select using ((select auth.uid()) = id);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
