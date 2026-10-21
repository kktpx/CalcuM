import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { DEFAULT_PROFILE, Profile, profileFromRow } from '../lib/profile';
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
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setProfile(DEFAULT_PROFILE);
      setLoadError(null);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      setLoadError('Could not load your profile.');
      setProfile(DEFAULT_PROFILE);
    } else {
      setLoadError(null);
      setProfile(profileFromRow(data));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!userId) return 'You are signed out.';
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId)
        .select()
        .maybeSingle();
      if (error || !data) return 'Could not save your profile. Please try again.';
      setProfile(profileFromRow(data));
      return null;
    },
    [userId]
  );

  const value = useMemo(
    () => ({ profile, loading, loadError, reload, updateProfile }),
    [profile, loading, loadError, reload, updateProfile]
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
