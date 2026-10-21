import { DEFAULT_PROFILE } from '../profile';
import { initialProfileState, profileReducer } from '../profileState';

const rowA = { display_name: 'A', calorie_target: 1800, protein_target: 100, carbs_target: 200, fat_target: 50 };
const rowB = { display_name: 'B', calorie_target: 2500, protein_target: 160, carbs_target: 300, fat_target: 70 };

describe('profileReducer', () => {
  test('ignores a late response for a user who is no longer current', () => {
    let s = profileReducer(initialProfileState, { type: 'user', userId: 'A' });
    s = profileReducer(s, { type: 'user', userId: 'B' });
    s = profileReducer(s, { type: 'loaded', userId: 'A', row: rowA });
    expect(s.profile).toEqual(DEFAULT_PROFILE);
    expect(s.loading).toBe(true);
  });

  test('a response arriving after sign-out is ignored', () => {
    let s = profileReducer(initialProfileState, { type: 'user', userId: 'A' });
    s = profileReducer(s, { type: 'user', userId: null });
    s = profileReducer(s, { type: 'loaded', userId: 'A', row: rowA });
    expect(s.profile).toEqual(DEFAULT_PROFILE);
  });

  test('switching users resets to defaults immediately', () => {
    let s = profileReducer(initialProfileState, { type: 'user', userId: 'A' });
    s = profileReducer(s, { type: 'loaded', userId: 'A', row: rowA });
    s = profileReducer(s, { type: 'user', userId: 'B' });
    expect(s.profile).toEqual(DEFAULT_PROFILE);
    expect(s.loadError).toBeNull();
  });

  test('a failed reload keeps the last good profile', () => {
    let s = profileReducer(initialProfileState, { type: 'user', userId: 'B' });
    s = profileReducer(s, { type: 'loaded', userId: 'B', row: rowB });
    s = profileReducer(s, { type: 'failed', userId: 'B' });
    expect(s.profile.calorieTarget).toBe(2500);
    expect(s.loadError).not.toBeNull();
    expect(s.loading).toBe(false);
  });

  test('a failed first load shows defaults with an error', () => {
    let s = profileReducer(initialProfileState, { type: 'user', userId: 'B' });
    s = profileReducer(s, { type: 'failed', userId: 'B' });
    expect(s.profile).toEqual(DEFAULT_PROFILE);
    expect(s.loadError).not.toBeNull();
  });

  test('a stale save result is ignored', () => {
    let s = profileReducer(initialProfileState, { type: 'user', userId: 'B' });
    s = profileReducer(s, { type: 'saved', userId: 'A', row: rowA });
    expect(s.profile).toEqual(DEFAULT_PROFILE);
  });
});
