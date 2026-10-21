import { friendlyAuthError } from '../authErrors';

describe('friendlyAuthError', () => {
  test.each([
    ['Invalid login credentials', 'Incorrect email or password.'],
    ['Email not confirmed', 'Please confirm your email first. Check your inbox.'],
    ['User already registered', 'This email is already registered. Try signing in.'],
    ['email rate limit exceeded', 'Too many attempts. Please wait a moment and try again.'],
    ['Network request failed', 'Network error. Check your connection and try again.'],
    ['boom', 'Something went wrong. Please try again.'],
  ])('%p', (input, expected) => {
    expect(friendlyAuthError(input)).toBe(expected);
  });
});
