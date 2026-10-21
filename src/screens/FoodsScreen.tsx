import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTabBarInset } from '../components/BottomTabBar';
import { useLoad } from '../hooks/useLoad';
import { addFood, addMeal, deleteFood, fetchFoods } from '../lib/api';
import {
  Food,
  FoodForm,
  MEAL_TYPES,
  MealType,
  defaultMealType,
  localDateString,
  validateFoodForm,
} from '../lib/nutrition';
import { CalcuColors } from '../theme/theme';

const EMPTY_FORM: FoodForm = { name: '', serving: '', calories: '', protein: '', carbs: '', fat: '' };

export function FoodsScreen() {
  const bottomInset = useTabBarInset();
  const { data: foods, setData: setFoods, loading, error, reload } = useLoad<Food[]>(fetchFoods, []);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FoodForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mealType, setMealType] = useState<MealType>(defaultMealType());
  const [notice, setNotice] = useState<string | null>(null);

  const set = (key: keyof FoodForm) => (text: string) => setForm((f) => ({ ...f, [key]: text }));

  const save = async () => {
    if (busy) return;
    setFormError(null);
    const check = validateFoodForm(form);
    if (!check.ok) {
      setFormError(check.error);
      return;
    }
    setBusy(true);
    try {
      const res = await addFood(check.food);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setFoods((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(EMPTY_FORM);
      setAdding(false);
    } finally {
      setBusy(false);
    }
  };

  const log = async (food: Food) => {
    setNotice(null);
    const res = await addMeal(localDateString(), mealType, food);
    setNotice(!res.ok ? res.error : `Added ${food.name} to ${mealType}.`);
  };

  const confirmDelete = (food: Food) => {
    Alert.alert('Delete food', `Remove "${food.name}" from your foods?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const err = await deleteFood(food.id);
          if (err) setNotice(err);
          else setFoods((prev) => prev.filter((f) => f.id !== food.id));
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text style={styles.title}>Foods</Text>
      <Text style={styles.subtitle}>Save your usual foods, then add them to today in one tap.</Text>

      <View style={styles.typeRow}>
        {MEAL_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setMealType(t)}
            style={[styles.chip, mealType === t && styles.chipActive]}
          >
            <Text style={[styles.chipText, mealType === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {notice && <Text style={styles.notice}>{notice}</Text>}

      {adding ? (
        <View style={styles.form}>
          <TextInput mode="outlined" label="Name" value={form.name} onChangeText={set('name')} />
          <TextInput
            mode="outlined"
            label="Serving (e.g. 1 plate)"
            value={form.serving}
            onChangeText={set('serving')}
            style={styles.gap}
          />
          <TextInput
            mode="outlined"
            label="Calories (kcal)"
            keyboardType="number-pad"
            value={form.calories}
            onChangeText={set('calories')}
            style={styles.gap}
          />
          <TextInput
            mode="outlined"
            label="Protein (g)"
            keyboardType="number-pad"
            value={form.protein}
            onChangeText={set('protein')}
            style={styles.gap}
          />
          <TextInput
            mode="outlined"
            label="Carbs (g)"
            keyboardType="number-pad"
            value={form.carbs}
            onChangeText={set('carbs')}
            style={styles.gap}
          />
          <TextInput
            mode="outlined"
            label="Fat (g)"
            keyboardType="number-pad"
            value={form.fat}
            onChangeText={set('fat')}
            style={styles.gap}
          />
          <HelperText type="error" visible={!!formError}>
            {formError}
          </HelperText>
          <Button mode="contained" onPress={save} loading={busy} disabled={busy}>
            Save food
          </Button>
          <Button
            onPress={() => {
              setAdding(false);
              setFormError(null);
            }}
            disabled={busy}
            style={styles.gap}
          >
            Cancel
          </Button>
        </View>
      ) : (
        <Button mode="contained" icon="plus" onPress={() => setAdding(true)} style={styles.gap}>
          New food
        </Button>
      )}

      {loading && foods.length === 0 ? (
        <ActivityIndicator color={CalcuColors.teal} style={styles.gap} />
      ) : error ? (
        <View style={styles.gap}>
          <HelperText type="error" visible>
            {error}
          </HelperText>
          <Button mode="outlined" onPress={reload} loading={loading}>
            Retry
          </Button>
        </View>
      ) : foods.length === 0 ? (
        <Text style={styles.empty}>No saved foods yet. Add your first one above.</Text>
      ) : (
        <View style={styles.card}>
          {foods.map((food, i) => (
            <View key={food.id}>
              <View style={styles.row}>
                <View style={styles.info}>
                  <Text style={styles.name}>{food.name}</Text>
                  <Text style={styles.meta}>
                    {food.serving} · {food.calories} kcal · P {food.protein} C {food.carbs} F {food.fat}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => log(food)}
                  accessibilityLabel={`Add ${food.name} to ${mealType}`}
                  style={styles.iconButton}
                >
                  <MaterialCommunityIcons name="plus-circle" size={28} color={CalcuColors.teal} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(food)}
                  accessibilityLabel={`Delete ${food.name}`}
                  style={styles.iconButton}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={22} color={CalcuColors.textMuted} />
                </TouchableOpacity>
              </View>
              {i < foods.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CalcuColors.background },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: CalcuColors.textPrimary },
  subtitle: { fontSize: 14, color: CalcuColors.textSecondary, marginTop: 4, marginBottom: 16 },
  gap: { marginTop: 12 },
  form: { marginTop: 4 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CalcuColors.borderMedium,
  },
  chipActive: { backgroundColor: CalcuColors.teal, borderColor: CalcuColors.teal },
  chipText: { fontSize: 13, color: CalcuColors.textSecondary },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  notice: { fontSize: 13, color: CalcuColors.teal, marginTop: 4 },
  empty: { color: CalcuColors.textSecondary, textAlign: 'center', marginTop: 32 },
  card: {
    marginTop: 16,
    backgroundColor: CalcuColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CalcuColors.borderMedium,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: CalcuColors.textPrimary },
  meta: { fontSize: 12, color: CalcuColors.textSecondary, marginTop: 2 },
  iconButton: { marginLeft: 8, padding: 4 },
  divider: { height: 1, backgroundColor: CalcuColors.borderMedium, marginVertical: 8 },
});
