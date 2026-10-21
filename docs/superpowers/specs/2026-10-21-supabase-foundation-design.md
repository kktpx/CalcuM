# Supabase Foundation (Sub-project 1) — Design

Date: 2026-10-21

## Context

CalcuM is an Expo / React Native (react-native-paper) calorie tracker. Everything is currently mock data (`src/data/mockData.ts`) and state lives in `DashboardScreen`. The user wants a Supabase back-end covering all tabs, decomposed into four sub-projects:

1. **Foundation** (this spec): auth + profile + health targets
2. Meals + Home
3. Foods + Weight
4. Real Quick Scan (Storage + Edge Function + AI). Decision: use the **Gemini API** for food-photo analysis, called from a Supabase Edge Function so the Gemini key stays server-side (stored as a Supabase secret, never in the app). Details are designed in that sub-project's own spec.

## Goal and success criteria

A user can sign up / sign in with email + password on iOS and Android, stay signed in across app restarts, see their own name and calorie/macro targets in the app, edit them in the Profile tab, and sign out. Another user can never read or modify their profile.

## Decisions (agreed with user)

- Auth: **email + password** only.
- Targets: new users get defaults (2000 kcal / P150 / C250 / F65), editable later in Profile. No onboarding wizard, no TDEE calculation.
- Schema managed as **SQL migrations in the repo** (`supabase/migrations/`). No Supabase project exists yet; the user creates it on supabase.com and runs the migration.
- App structure: keep the existing `useState` tab switch in `App.tsx`; no navigation library (YAGNI). Unauthenticated users see an auth screen instead of the tabs.
- Email confirmation disabled in Supabase during development.

## Out of scope

Meals, weight logs, foods DB, image upload/AI scan, OAuth providers, magic links, password reset, onboarding, push notifications. `DashboardScreen` meals and `QuickScan` stay mock until sub-projects 2 and 4.

## Database

`supabase/migrations/0001_profiles.sql`:

- Table `public.profiles`
  - `id uuid primary key references auth.users(id) on delete cascade`
  - `display_name text not null default ''`
  - `calorie_target int not null default 2000 check (calorie_target > 0)`
  - `protein_target int not null default 150 check (protein_target >= 0)`
  - `carbs_target int not null default 250 check (carbs_target >= 0)`
  - `fat_target int not null default 65 check (fat_target >= 0)`
  - `created_at timestamptz not null default now()`
- Function + trigger `on_auth_user_created` (`security definer`, `set search_path = ''`): after insert on `auth.users`, insert a profile row. `display_name` defaults to the email local-part.
- RLS enabled. Policies: `select` and `update` where `auth.uid() = id`. No client `insert` or `delete` policy (the trigger creates the row; deletion cascades from auth).

## App architecture

New and changed units, each with one purpose:

| Unit | Purpose | Depends on |
|---|---|---|
| `src/lib/supabase.ts` | Creates the `supabase-js` client from `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`; persists session with AsyncStorage; auto-refresh tied to AppState | env, AsyncStorage |
| `src/auth/AuthProvider.tsx` | Context exposing `session`, `loading`, `signIn`, `signUp`, `signOut`; subscribes to `onAuthStateChange` | `supabase.ts` |
| `src/hooks/useProfile.ts` | Loads the current user's profile; `updateProfile(patch)` | `AuthProvider`, `supabase.ts` |
| `src/lib/validation.ts` | Pure functions: validate email/password for the auth form, validate target values (integers in range) | none |
| `src/screens/AuthScreen.tsx` | Email + password form, toggle sign-in / sign-up, error text; Paper `TextInput` / `Button` | `AuthProvider`, `validation.ts` |
| `src/screens/ProfileScreen.tsx` | Replaces the Profile placeholder: edit name + 4 targets, save, sign out | `useProfile`, `validation.ts` |
| `App.tsx` | Wraps in `AuthProvider`; while `loading` shows a spinner; no session → `AuthScreen`; else tabs | `AuthProvider` |
| `CalcuAppbar` | Name and initials from profile instead of `mockUser` | `useProfile` |
| `DashboardScreen` | Targets from profile instead of `mockTargets` (meals stay mock) | `useProfile` |

`.env.example` documents the two env vars; `.env` is git-ignored.

## Data flow

1. App start: `AuthProvider` reads the persisted session (`loading` true until resolved).
2. No session → `AuthScreen`. Sign-up/sign-in calls `supabase.auth.*`; on success `onAuthStateChange` updates the session and `App` renders the tabs.
3. With a session, `useProfile` selects the user's row. Appbar, Dashboard and Profile read from it.
4. Profile save → `update` on `profiles` filtered by `id`; local state updates on success.
5. Sign out → `supabase.auth.signOut()`; session clears and `AuthScreen` shows.

## Error handling

- Form validation errors shown inline before any network call.
- Supabase errors (invalid credentials, email already registered, network failure) mapped to short user-facing messages; unknown errors show a generic message.
- Profile load failure shows a retry state; the dashboard falls back to default targets while loading so layout does not jump.
- Profile save failure keeps the user's input and shows the error.

## Testing

- Unit tests (Jest) for `validation.ts`.
- SQL verified by applying the migration to a fresh Supabase project and checking: trigger creates a profile on sign-up; user A cannot select or update user B's row.
- Manual run on iOS and Android: sign up, restart app (session persists), edit targets (Dashboard ring/macros reflect new targets), sign out, sign in again.

## Manual steps the user must do

1. Create a project on supabase.com.
2. Run `supabase/migrations/0001_profiles.sql` in the SQL editor (or via the Supabase CLI).
3. Authentication → Providers → Email: turn off "Confirm email" for development.
4. Copy the project URL and anon key into `.env` (see `.env.example`).

## Implementation notes

- `AGENTS.md` requires reading the versioned Expo docs (https://docs.expo.dev/versions/v57.0.0/) before writing code; check them for AsyncStorage and env var (`EXPO_PUBLIC_*`) usage and install packages with `npx expo install`.
- Dependencies to add: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, plus `react-native-url-polyfill` if the Expo docs / supabase-js require it.
- Never put the service-role key in the app; only the anon key.
