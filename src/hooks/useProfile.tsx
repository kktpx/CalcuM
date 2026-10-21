import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/profile';
import { initialProfileState, profileReducer } from '../lib/profileState';
import type { ProfilePatch } from '../lib/validation';

interface ProfileContextValue {
  profile: Profile;
  loading: boolean;
  loadError: string | null;
  reload(): Promise<void>;
  updateProfile(patch: ProfilePatch): Promise<string | null>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);

  // Results are tagged with the userId they were requested for; the reducer drops
  // any that no longer match the current user.
  const reload = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) dispatch({ type: 'failed', userId });
    else dispatch({ type: 'loaded', userId, row: data });
  }, [userId]);

  useEffect(() => {
    dispatch({ type: 'user', userId });
    reload();
  }, [userId, reload]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!userId) return 'You are signed out.';
      // upsert so a user whose profile row is missing can still save
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...patch })
        .select()
        .maybeSingle();
      if (error || !data) return 'Could not save your profile. Please try again.';
      dispatch({ type: 'saved', userId, row: data });
      return null;
    },
    [userId]
  );

  const value = useMemo(
    () => ({ profile: state.profile, loading: state.loading, loadError: state.loadError, reload, updateProfile }),
    [state.profile, state.loading, state.loadError, reload, updateProfile]
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
