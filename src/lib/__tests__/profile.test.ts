import { DEFAULT_PROFILE, initialsOf, profileFromRow } from '../profile';

describe('profileFromRow', () => {
  test('maps a full row', () => {
    expect(
      profileFromRow({
        display_name: 'Kit',
        calorie_target: 1800,
        protein_target: 120,
        carbs_target: 200,
        fat_target: 50,
      })
    ).toEqual({ displayName: 'Kit', calorieTarget: 1800, proteinTarget: 120, carbsTarget: 200, fatTarget: 50 });
  });
  test('null row gives the defaults', () => {
    expect(profileFromRow(null)).toEqual(DEFAULT_PROFILE);
    expect(DEFAULT_PROFILE).toEqual({
      displayName: '',
      calorieTarget: 2000,
      proteinTarget: 150,
      carbsTarget: 250,
      fatTarget: 65,
    });
  });
  test('a non-numeric field falls back to its default only', () => {
    const p = profileFromRow({ display_name: 'Kit', calorie_target: 'abc', protein_target: 120 });
    expect(p.calorieTarget).toBe(2000);
    expect(p.proteinTarget).toBe(120);
    expect(p.displayName).toBe('Kit');
  });
});

describe('initialsOf', () => {
  test.each([
    ['Kit Sanpho', 'KS'],
    ['kit', 'K'],
    ['', '?'],
    ['  a  b  c ', 'AB'],
  ])('%p -> %p', (name, expected) => {
    expect(initialsOf(name)).toBe(expected);
  });
});
