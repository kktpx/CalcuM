import { DEFAULT_PROFILE, Profile, profileFromRow } from './profile';

export interface ProfileState {
  userId: string | null;
  profile: Profile;
  loaded: boolean;
  loading: boolean;
  loadError: string | null;
}

export type ProfileAction =
  | { type: 'user'; userId: string | null }
  | { type: 'loaded' | 'saved'; userId: string; row: Record<string, unknown> | null }
  | { type: 'failed'; userId: string };

export const initialProfileState: ProfileState = {
  userId: null,
  profile: DEFAULT_PROFILE,
  loaded: false,
  loading: false,
  loadError: null,
};

// Every async result carries the userId it was requested for; results for anyone
// other than the current user are dropped so one account's data never shows for another.
export function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  if (action.type === 'user') {
    if (action.userId === state.userId) return state;
    return { ...initialProfileState, userId: action.userId, loading: action.userId !== null };
  }
  if (action.userId !== state.userId) return state;

  if (action.type === 'failed') {
    return { ...state, loading: false, loadError: 'Could not load your profile.' };
  }
  return {
    ...state,
    profile: profileFromRow(action.row),
    loaded: true,
    loading: false,
    loadError: null,
  };
}
