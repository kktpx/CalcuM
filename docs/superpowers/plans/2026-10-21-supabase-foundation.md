# Supabase Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Email/password auth plus a per-user profile (name + kcal/macro targets) backed by Supabase, wired into the existing Expo app on iOS and Android.

**Architecture:** `supabase-js` client persisting its session in AsyncStorage; an `AuthProvider` and a `ProfileProvider` (React contexts) feed `App.tsx`, which shows `AuthScreen` when signed out and the existing tab UI when signed in. Pure logic (validation, row mapping) lives in `src/lib` and is unit-tested; SQL lives in `supabase/migrations`.

**Tech Stack:** Expo / React Native 0.74, react-native-paper, `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, Jest (`jest-expo`).

**Spec:** `docs/superpowers/specs/2026-10-21-supabase-foundation-design.md`

## Global Constraints

- Auth is email + password only; no OAuth, magic link, password reset or onboarding.
- Default targets: 2000 kcal / protein 150 / carbs 250 / fat 65.
- Only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the app; never the service-role key; `.env` is git-ignored, `.env.example` is committed.
- Must run on iOS and Android (no web-only APIs, no platform-specific code paths needed).
- Meals and Quick Scan stay mock; do not touch them beyond what Task 8 states.
- `AGENTS.md`: read the versioned Expo docs before writing Expo-related code. `package.json` currently pins `expo ~51.0.28` while `AGENTS.md` links the v57 docs; check which SDK is actually installed (`npx expo --version`) and read the docs for that version. Install native packages with `npx expo install`.
- Repo note: `git` reports "dubious ownership" on this machine; prefix git commands with `-c safe.directory=D:/CalcuM` rather than changing global config.

## Review Focus

- Email typed with leading/trailing spaces or capitals: trimmed and accepted (Task 2).
- Target fields: empty, `2000.5`, `1e3`, negative, or absurdly large input must show an error, not save garbage (Task 2).
- Sign-up when "Confirm email" is still ON in Supabase: no session is returned, so the UI must say to check email instead of silently doing nothing (Task 4/5).
- Profile row missing or load fails: app falls back to default targets and shows a retry, never crashes or shows NaN (Task 6).
- Double-tapping Sign in / Save: button disabled while the request is in flight (Task 5/7).

---

## File Structure

| File | Responsibility |
|---|---|
| `.env.example`, `.gitignore` | Env template (created), ignore `.env` |
| `jest.config.js`, `package.json` | Jest via `jest-expo`, `test` script |
| `src/lib/validation.ts` | Pure form validation |
| `src/lib/profile.ts` | `Profile` type, defaults, DB row mapping |
| `src/lib/supabase.ts` | Supabase client |
| `src/auth/AuthProvider.tsx` | Session context |
| `src/hooks/useProfile.tsx` | `ProfileProvider` + `useProfile` (shared state so Appbar, Dashboard and Profile stay in sync after a save) |
| `src/screens/AuthScreen.tsx`, `ProfileScreen.tsx` | New screens |
| `supabase/migrations/0001_profiles.sql` | Table, trigger, RLS |
| `App.tsx`, `CalcuAppbar.tsx`, `DashboardScreen.tsx` | Wire-up |

---

### Task 1: Tooling, dependencies, env

**Files:**
- Modify: `package.json`, `.gitignore`
- Create: `jest.config.js`
- Already created: `.env.example`

**Produces:** `npm test` runs Jest; `@supabase/supabase-js` and AsyncStorage installed; `.env` ignored.

- [ ] **Step 1:** Read the Expo docs for the installed SDK (see Global Constraints), then run `npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill` and `npx expo install -- --save-dev jest-expo jest @types/jest`.
- [ ] **Step 2:** Add `"test": "jest"` to `package.json` scripts and create `jest.config.js` with `preset: 'jest-expo'`.
- [ ] **Step 3:** Add a line `.env` to `.gitignore`. Verify with `git -c safe.directory=D:/CalcuM check-ignore .env` (prints `.env`).
- [ ] **Step 4:** Run `npx jest --passWithNoTests`. Expected: exits 0.
- [ ] **Step 5:** Commit `.env.example`, `.gitignore`, `jest.config.js`, `package.json`, `package-lock.json` (`chore: add supabase deps, jest, env template`).

### Task 2: Validation (pure)

**Files:** Create `src/lib/validation.ts`; Test `src/lib/__tests__/validation.test.ts`

**Produces:**
```ts
export function validateCredentials(email: string, password: string):
  { ok: true; email: string } | { ok: false; error: string };
export interface ProfileForm { displayName: string; calorie: string; protein: string; carbs: string; fat: string }
export interface ProfilePatch { display_name: string; calorie_target: number; protein_target: number; carbs_target: number; fat_target: number }
export function validateProfileForm(f: ProfileForm):
  { ok: true; patch: ProfilePatch } | { ok: false; error: string };
```
Rules: email trimmed and must look like `x@y.z`; password at least 6 characters (Supabase default). Targets must match `^\d+$` after trim; calorie 500–10000, each macro 0–1000; `displayName` trimmed, 1–50 chars.

- [ ] **Step 1:** Write failing tests: `' A@B.co '` → `{ok:true,email:'A@B.co'}`; `'nope'` → not ok; password `'12345'` → not ok, `'123456'` ok; form with `calorie:'2000.5'`, `'1e3'`, `'-5'`, `''`, `'499'`, `'10001'`, protein `'1001'`, empty name → each `ok:false`; valid form `{displayName:' Kit ', calorie:'2000', protein:'150', carbs:'250', fat:'65'}` → patch `{display_name:'Kit', calorie_target:2000, protein_target:150, carbs_target:250, fat_target:65}`; macro `'0'` ok.
- [ ] **Step 2:** `npx jest src/lib/__tests__/validation.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement the two functions as specified.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit (`feat: add form validation`).

### Task 3: Profile model (pure)

**Files:** Create `src/lib/profile.ts`; Test `src/lib/__tests__/profile.test.ts`

**Produces:**
```ts
export interface Profile { displayName: string; calorieTarget: number; proteinTarget: number; carbsTarget: number; fatTarget: number }
export const DEFAULT_PROFILE: Profile; // displayName '', 2000/150/250/65
export function profileFromRow(row: Record<string, unknown> | null): Profile;
export function initialsOf(name: string): string; // 'Kit Sanpho' -> 'KS', 'kit' -> 'K', '' -> '?'
```
`profileFromRow` maps snake_case columns; `null` or any missing / non-numeric field falls back to the default for that field.

- [ ] **Step 1:** Failing tests: full row maps correctly; `null` → `DEFAULT_PROFILE`; row with `calorie_target:'abc'` keeps default calories but maps others; `initialsOf` cases above plus `'  a  b  c '` → `'AB'`.
- [ ] **Step 2:** Run; Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run; Expected: PASS.
- [ ] **Step 5:** Commit (`feat: add profile model`).

### Task 4: Database migration

**Files:** Create `supabase/migrations/0001_profiles.sql`

Contents exactly as in the spec "Database" section: `profiles` table with check constraints, `security definer` trigger function with `set search_path = ''` creating the row on `auth.users` insert (display name = part of email before `@`), RLS enabled with `select` and `update` policies on `auth.uid() = id`, no insert/delete policy.

- [ ] **Step 1:** Write the SQL file.
- [ ] **Step 2 (user):** In a new Supabase project, run the file in the SQL editor; in Authentication → Providers → Email turn off "Confirm email"; copy URL + anon key into `.env`.
- [ ] **Step 3 (verify, SQL editor):** create two users via the dashboard; `select count(*) from public.profiles;` returns 2 with default targets. Via the REST API with user A's token, `GET /rest/v1/profiles` returns only A's row, and `PATCH` of B's row updates 0 rows.
- [ ] **Step 4:** Commit (`feat: add profiles migration`).

### Task 5: Supabase client and AuthProvider

**Files:** Create `src/lib/supabase.ts`, `src/auth/AuthProvider.tsx`

**Consumes:** env vars from Task 1/4.

**Produces:**
```ts
export const supabase: SupabaseClient; // storage: AsyncStorage, autoRefreshToken, persistSession, detectSessionInUrl: false
export function AuthProvider(props: { children: React.ReactNode }): JSX.Element;
export function useAuth(): {
  session: Session | null; loading: boolean;
  signIn(email: string, password: string): Promise<string | null>;        // error message or null
  signUp(email: string, password: string): Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut(): Promise<void>;
};
```
Notes: import `react-native-url-polyfill/auto` at the top of `supabase.ts`; call `supabase.auth.startAutoRefresh()` / `stopAutoRefresh()` on AppState `active` / background; `needsConfirmation` is true when sign-up succeeds with no session; map `Invalid login credentials` and `User already registered` to friendly messages and anything else to a generic one; throw a clear error at import if either env var is missing.

- [ ] **Step 1:** Implement both files.
- [ ] **Step 2:** `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 3:** Commit (`feat: add supabase client and auth provider`).

### Task 6: ProfileProvider

**Files:** Create `src/hooks/useProfile.tsx`

**Consumes:** `useAuth`, `supabase`, `profileFromRow`, `DEFAULT_PROFILE`, `ProfilePatch`.

**Produces:**
```ts
export function ProfileProvider(props: { children: React.ReactNode }): JSX.Element; // must be inside AuthProvider
export function useProfile(): {
  profile: Profile;            // DEFAULT_PROFILE until loaded or on failure
  loading: boolean;
  loadError: string | null;
  reload(): Promise<void>;
  updateProfile(patch: ProfilePatch): Promise<string | null>; // error message or null; updates state on success
};
```
Loads `profiles` row with `.eq('id', session.user.id).maybeSingle()` whenever the session user changes; resets to default when signed out.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 3:** Commit (`feat: add profile provider`).

### Task 7: Screens and App gating

**Files:** Create `src/screens/AuthScreen.tsx`, `src/screens/ProfileScreen.tsx`; Modify `App.tsx`

**Consumes:** `useAuth`, `useProfile`, `validateCredentials`, `validateProfileForm`.

- `AuthScreen`: Paper `TextInput` (email, password with secure entry toggle) and `Button`; toggle between sign in / create account; inline error via `HelperText`; button `disabled` and `loading` while a request runs; if `signUp` returns `needsConfirmation`, show "Check your email to confirm your account".
- `ProfileScreen`: fields for name and the four targets (numeric keyboard), prefilled from `useProfile().profile`; Save runs `validateProfileForm` then `updateProfile`, shows error or "Saved"; Save disabled while in flight; "Sign out" button; show a retry button when `loadError` is set.
- `App.tsx`: wrap in `AuthProvider` > `ProfileProvider` (inside `PaperProvider`); while `loading` show a centered `ActivityIndicator`; no session → `AuthScreen` (no Appbar or tab bar); otherwise existing layout with the `profile` tab rendering `ProfileScreen` instead of `PlaceholderScreen`. Use `KeyboardAvoidingView` (`behavior` `'padding'` on iOS, `'height'` on Android) and `keyboardShouldPersistTaps="handled"` on both forms.

- [ ] **Step 1:** Implement the three files.
- [ ] **Step 2:** `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 3:** Run `npx expo start`; on a device/emulator verify sign-up → lands on Home, kill and reopen → still signed in, Profile → Sign out → AuthScreen. Repeat on both iOS and Android.
- [ ] **Step 4:** Commit (`feat: add auth and profile screens`).

### Task 8: Use the profile in Appbar and Dashboard

**Files:** Modify `src/components/CalcuAppbar.tsx`, `src/screens/DashboardScreen.tsx`

- `CalcuAppbar`: avatar label = `initialsOf(profile.displayName)`; replace `mockUser` usage (keep `mockNotificationCount`).
- `DashboardScreen`: build `targets` from `useProfile().profile` (`calorieTarget`, `proteinTarget`, `carbsTarget`, `fatTarget`) instead of `mockTargets`. Keep `mockConsumed`, meals and QuickScan as is.

- [ ] **Step 1:** Make the two edits.
- [ ] **Step 2:** `npx tsc --noEmit && npx jest`. Expected: no type errors, all tests pass.
- [ ] **Step 3:** On device: change calorie target to 1500 in Profile and Save; Home ring/remaining update without restarting; Appbar initials match the new name.
- [ ] **Step 4:** Commit (`feat: drive appbar and dashboard from profile`).

### Task 9: Final verification

- [ ] **Step 1:** `npx tsc --noEmit && npx jest`. Expected: clean.
- [ ] **Step 2:** Walk the spec's manual test list on iOS and Android, plus two accounts to confirm one cannot see the other's targets.
- [ ] **Step 3:** Confirm `git -c safe.directory=D:/CalcuM status` shows no `.env` and the working tree is committed.
