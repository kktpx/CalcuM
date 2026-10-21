export function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.';
  if (/email not confirmed/i.test(message)) return 'Please confirm your email first. Check your inbox.';
  if (/already registered/i.test(message)) return 'This email is already registered. Try signing in.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a moment and try again.';
  if (/network|fetch/i.test(message)) return 'Network error. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
