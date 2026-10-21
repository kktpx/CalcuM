export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Food extends Macros {
  id: string;
  name: string;
  serving: string;
}

export interface Meal extends Macros {
  id: string;
  type: MealType;
  name: string;
}

export interface WeightLog {
  id: string;
  date: string;
  kg: number;
}

export interface ScanResult extends Macros {
  name: string;
  servingSize: string;
}

export function sumMacros(items: Macros[]): Macros {
  return items.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/** YYYY-MM-DD of the device's local calendar day (the day the user is living in). */
export function localDateString(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function defaultMealType(d: Date = new Date()): MealType {
  const h = d.getHours();
  if (h >= 5 && h < 11) return 'Breakfast';
  if (h >= 11 && h < 16) return 'Lunch';
  if (h >= 16 && h < 22) return 'Dinner';
  return 'Snack';
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Validates the Edge Function's reply; anything unusable (or "no food found") yields null. */
export function parseScanResult(raw: unknown): ScanResult | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  if (!name) return null;
  if (!isNum(r.calories) || !isNum(r.protein) || !isNum(r.carbs) || !isNum(r.fat)) return null;
  if (r.calories < 0 || r.protein < 0 || r.carbs < 0 || r.fat < 0) return null;
  const servingSize = typeof r.servingSize === 'string' && r.servingSize.trim() ? r.servingSize.trim() : '1 serving';
  return {
    name: name.slice(0, 100),
    servingSize: servingSize.slice(0, 50),
    calories: Math.min(10000, Math.round(r.calories)),
    protein: Math.min(1000, Math.round(r.protein)),
    carbs: Math.min(1000, Math.round(r.carbs)),
    fat: Math.min(1000, Math.round(r.fat)),
  };
}

export interface FoodForm {
  name: string;
  serving: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export type FoodFormResult =
  | { ok: true; food: Omit<Food, 'id'> }
  | { ok: false; error: string };

function whole(text: string, min: number, max: number, emptyValue: number | null): number | null {
  const t = text.trim();
  if (t === '') return emptyValue;
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= min && n <= max ? n : null;
}

export function validateFoodForm(f: FoodForm): FoodFormResult {
  const name = f.name.trim();
  if (name.length < 1 || name.length > 100) return { ok: false, error: 'Name must be 1-100 characters.' };
  const serving = f.serving.trim() || '1 serving';
  if (serving.length > 50) return { ok: false, error: 'Serving must be at most 50 characters.' };
  const calories = whole(f.calories, 0, 10000, null);
  if (calories === null) return { ok: false, error: 'Calories must be a whole number from 0 to 10000.' };
  const protein = whole(f.protein, 0, 1000, 0);
  if (protein === null) return { ok: false, error: 'Protein must be a whole number from 0 to 1000.' };
  const carbs = whole(f.carbs, 0, 1000, 0);
  if (carbs === null) return { ok: false, error: 'Carbs must be a whole number from 0 to 1000.' };
  const fat = whole(f.fat, 0, 1000, 0);
  if (fat === null) return { ok: false, error: 'Fat must be a whole number from 0 to 1000.' };
  return { ok: true, food: { name, serving, calories, protein, carbs, fat } };
}

/** Parses a weight in kg (one decimal, "," or "." accepted); null when invalid or outside 20-500. */
export function validateWeight(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (!/^\d+(\.\d)?$/.test(t)) return null;
  const n = Number(t);
  return n >= 20 && n <= 500 ? n : null;
}
