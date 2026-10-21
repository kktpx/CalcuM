-- Align DB limits with the app's validation and stop clients editing created_at.

alter table public.profiles
  add constraint profiles_display_name_len check (char_length(display_name) <= 50),
  add constraint profiles_calorie_range check (calorie_target between 500 and 10000),
  add constraint profiles_protein_max check (protein_target <= 1000),
  add constraint profiles_carbs_max check (carbs_target <= 1000),
  add constraint profiles_fat_max check (fat_target <= 1000);

-- Column-level update: everything except created_at (id stays so upsert works; RLS pins it to auth.uid()).
revoke update on public.profiles from authenticated;
grant update (id, display_name, calorie_target, protein_target, carbs_target, fat_target)
  on public.profiles to authenticated;
