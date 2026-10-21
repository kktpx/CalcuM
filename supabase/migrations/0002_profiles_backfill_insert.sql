-- Fix-up for users that have no profile row (created before 0001 or whose trigger
-- insert failed), and let a user create their own row so saving always works.

insert into public.profiles (id, display_name)
select id, split_part(coalesce(email, ''), '@', 1)
from auth.users
on conflict (id) do nothing;

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
