-- Profiles: one row per auth user, holding display name and daily targets.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  calorie_target int not null default 2000 check (calorie_target > 0),
  protein_target int not null default 150 check (protein_target >= 0),
  carbs_target int not null default 250 check (carbs_target >= 0),
  fat_target int not null default 65 check (fat_target >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read and update only their own row. No insert/delete policy:
-- the trigger below creates the row and deletion cascades from auth.users.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(coalesce(new.email, ''), '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
