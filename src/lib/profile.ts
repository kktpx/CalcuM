export interface Profile {
  displayName: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

export const DEFAULT_PROFILE: Profile = {
  displayName: '',
  calorieTarget: 2000,
  proteinTarget: 150,
  carbsTarget: 250,
  fatTarget: 65,
};

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

export function profileFromRow(row: Record<string, unknown> | null): Profile {
  if (!row) return DEFAULT_PROFILE;
  return {
    displayName: typeof row.display_name === 'string' ? row.display_name : DEFAULT_PROFILE.displayName,
    calorieTarget: num(row.calorie_target, DEFAULT_PROFILE.calorieTarget),
    proteinTarget: num(row.protein_target, DEFAULT_PROFILE.proteinTarget),
    carbsTarget: num(row.carbs_target, DEFAULT_PROFILE.carbsTarget),
    fatTarget: num(row.fat_target, DEFAULT_PROFILE.fatTarget),
  };
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}
