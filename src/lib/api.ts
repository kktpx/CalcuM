import { supabase } from './supabase';
import { Food, Macros, Meal, MealType, ScanResult, WeightLog, parseScanResult } from './nutrition';

// Each call resolves to { ok: true, data } or { ok: false, error } with a short user-facing message.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });
const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data });

const mealFromRow = (r: any): Meal => ({
  id: r.id,
  type: r.type,
  name: r.name,
  calories: r.calories,
  protein: r.protein,
  carbs: r.carbs,
  fat: r.fat,
});

const foodFromRow = (r: any): Food => ({
  id: r.id,
  name: r.name,
  serving: r.serving,
  calories: r.calories,
  protein: r.protein,
  carbs: r.carbs,
  fat: r.fat,
});

export async function fetchMeals(date: string): Promise<ApiResult<Meal[]>> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('eaten_on', date)
    .order('created_at', { ascending: true });
  if (error) return fail('Could not load meals.');
  return ok((data ?? []).map(mealFromRow));
}

export async function addMeal(
  date: string,
  type: MealType,
  item: Macros & { name: string }
): Promise<ApiResult<Meal>> {
  const { data, error } = await supabase
    .from('meals')
    .insert({
      eaten_on: date,
      type,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })
    .select()
    .single();
  if (error || !data) return fail('Could not save the meal. Please try again.');
  return ok(mealFromRow(data));
}

export async function deleteMeal(id: string): Promise<string | null> {
  const { error } = await supabase.from('meals').delete().eq('id', id);
  return error ? 'Could not delete the meal.' : null;
}

export async function fetchFoods(): Promise<ApiResult<Food[]>> {
  const { data, error } = await supabase.from('foods').select('*').order('name', { ascending: true });
  if (error) return fail('Could not load foods.');
  return ok((data ?? []).map(foodFromRow));
}

export async function addFood(food: Omit<Food, 'id'>): Promise<ApiResult<Food>> {
  const { data, error } = await supabase.from('foods').insert(food).select().single();
  if (error || !data) return fail('Could not save the food. Please try again.');
  return ok(foodFromRow(data));
}

export async function deleteFood(id: string): Promise<string | null> {
  const { error } = await supabase.from('foods').delete().eq('id', id);
  return error ? 'Could not delete the food.' : null;
}

export async function fetchWeightLogs(): Promise<ApiResult<WeightLog[]>> {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('id, logged_on, weight_kg')
    .order('logged_on', { ascending: false })
    .limit(90);
  if (error) return fail('Could not load weight history.');
  return ok((data ?? []).map((r: any) => ({ id: r.id, date: r.logged_on, kg: Number(r.weight_kg) })));
}

/** One log per day: logging again on the same day replaces that day's weight. */
export async function saveWeight(date: string, kg: number): Promise<string | null> {
  const { error } = await supabase
    .from('weight_logs')
    .upsert({ logged_on: date, weight_kg: kg }, { onConflict: 'user_id,logged_on' });
  return error ? 'Could not save your weight. Please try again.' : null;
}

export async function deleteWeight(id: string): Promise<string | null> {
  const { error } = await supabase.from('weight_logs').delete().eq('id', id);
  return error ? 'Could not delete the entry.' : null;
}

export async function analyzeFood(base64: string, mimeType: string): Promise<ApiResult<ScanResult>> {
  const { data, error } = await supabase.functions.invoke('analyze-food', { body: { image: base64, mimeType } });
  if (error) return fail('Could not analyze the photo. Check your connection and try again.');
  const result = parseScanResult(data);
  if (!result) return fail("We couldn't find food in that photo. Try a clearer one.");
  return ok(result);
}
