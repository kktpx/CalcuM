-- Meals eaten, saved foods and weight logs. Every row belongs to one user (RLS).

create table public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  serving text not null default '1 serving' check (char_length(serving) <= 50),
  calories int not null check (calories between 0 and 10000),
  protein int not null default 0 check (protein between 0 and 1000),
  carbs int not null default 0 check (carbs between 0 and 1000),
  fat int not null default 0 check (fat between 0 and 1000),
  created_at timestamptz not null default now()
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  eaten_on date not null,
  type text not null check (type in ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  name text not null check (char_length(name) between 1 and 100),
  calories int not null check (calories between 0 and 10000),
  protein int not null default 0 check (protein between 0 and 1000),
  carbs int not null default 0 check (carbs between 0 and 1000),
  fat int not null default 0 check (fat between 0 and 1000),
  created_at timestamptz not null default now()
);
create index meals_user_day_idx on public.meals (user_id, eaten_on);

create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  logged_on date not null,
  weight_kg numeric(5, 1) not null check (weight_kg between 20 and 500),
  created_at timestamptz not null default now(),
  unique (user_id, logged_on)
);

alter table public.foods enable row level security;
alter table public.meals enable row level security;
alter table public.weight_logs enable row level security;

create policy "foods_own" on public.foods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals_own" on public.meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weight_logs_own" on public.weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
