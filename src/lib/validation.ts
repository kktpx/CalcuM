export type CredentialsResult = { ok: true; email: string } | { ok: false; error: string };

export interface ProfileForm {
  displayName: string;
  calorie: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface ProfilePatch {
  display_name: string;
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
}

export type ProfileFormResult = { ok: true; patch: ProfilePatch } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

export function validateCredentials(email: string, password: string): CredentialsResult {
  const trimmed = email.trim();
  if (!EMAIL_RE.test(trimmed)) return { ok: false, error: 'Enter a valid email address.' };
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  return { ok: true, email: trimmed };
}

function parseWhole(text: string, min: number, max: number): number | null {
  const t = text.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= min && n <= max ? n : null;
}

export function validateProfileForm(f: ProfileForm): ProfileFormResult {
  const name = f.displayName.trim();
  if (name.length < 1 || name.length > 50) {
    return { ok: false, error: 'Name must be 1-50 characters.' };
  }
  const calorie = parseWhole(f.calorie, 500, 10000);
  if (calorie === null) return { ok: false, error: 'Calories must be a whole number from 500 to 10000.' };
  const protein = parseWhole(f.protein, 0, 1000);
  if (protein === null) return { ok: false, error: 'Protein must be a whole number from 0 to 1000.' };
  const carbs = parseWhole(f.carbs, 0, 1000);
  if (carbs === null) return { ok: false, error: 'Carbs must be a whole number from 0 to 1000.' };
  const fat = parseWhole(f.fat, 0, 1000);
  if (fat === null) return { ok: false, error: 'Fat must be a whole number from 0 to 1000.' };

  return {
    ok: true,
    patch: {
      display_name: name,
      calorie_target: calorie,
      protein_target: protein,
      carbs_target: carbs,
      fat_target: fat,
    },
  };
}
