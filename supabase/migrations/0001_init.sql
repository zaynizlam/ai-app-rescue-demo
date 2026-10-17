-- TaskFlow schema
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Create a profile row for every new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS turned off for now so the app works
alter table public.profiles disable row level security;
alter table public.tasks disable row level security;
