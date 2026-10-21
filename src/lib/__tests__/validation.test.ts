import { validateCredentials, validateProfileForm, ProfileForm } from '../validation';

const goodForm: ProfileForm = {
  displayName: ' Kit ',
  calorie: '2000',
  protein: '150',
  carbs: '250',
  fat: '65',
};

describe('validateCredentials', () => {
  test('trims the email and accepts a valid pair', () => {
    expect(validateCredentials(' A@B.co ', '123456')).toEqual({ ok: true, email: 'A@B.co' });
  });
  test('rejects a malformed email', () => {
    expect(validateCredentials('nope', '123456').ok).toBe(false);
  });
  test('rejects a password shorter than 6 characters', () => {
    expect(validateCredentials('a@b.co', '12345').ok).toBe(false);
  });
});

describe('validateProfileForm', () => {
  test('accepts a valid form and trims the name', () => {
    expect(validateProfileForm(goodForm)).toEqual({
      ok: true,
      patch: {
        display_name: 'Kit',
        calorie_target: 2000,
        protein_target: 150,
        carbs_target: 250,
        fat_target: 65,
      },
    });
  });
  test('accepts 0 for a macro', () => {
    expect(validateProfileForm({ ...goodForm, fat: '0' }).ok).toBe(true);
  });
  test.each(['2000.5', '1e3', '-5', '', '499', '10001'])('rejects calorie %p', (calorie) => {
    expect(validateProfileForm({ ...goodForm, calorie }).ok).toBe(false);
  });
  test('rejects protein above 1000', () => {
    expect(validateProfileForm({ ...goodForm, protein: '1001' }).ok).toBe(false);
  });
  test('rejects an empty name', () => {
    expect(validateProfileForm({ ...goodForm, displayName: '   ' }).ok).toBe(false);
  });
});
