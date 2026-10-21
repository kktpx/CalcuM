import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useTabBarInset } from '../components/BottomTabBar';
import { DailyGoalBanner } from '../components/DailyGoalBanner';
import { QuickScan } from '../components/QuickScan';
import { CalorieRing } from '../components/CalorieRing';
import { MacroCard } from '../components/MacroCard';
import { MealList } from '../components/MealList';
import { CalcuColors } from '../theme/theme';
import { useProfile } from '../hooks/useProfile';
import { useLoad } from '../hooks/useLoad';
import { addMeal, deleteMeal, fetchMeals } from '../lib/api';
import { Meal, MealType, ScanResult, localDateString, sumMacros } from '../lib/nutrition';

export function DashboardScreen() {
  const { profile, loaded, loadError } = useProfile();
  const bottomInset = useTabBarInset();
  const [today] = useState(() => localDateString());
  const [bannerVisible, setBannerVisible] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchToday = useCallback(() => fetchMeals(today), [today]);
  const { data: meals, setData: setMeals, loading, error, reload } = useLoad<Meal[]>(fetchToday, []);

  const handleAddMeal = async (type: MealType, item: ScanResult): Promise<string | null> => {
    const res = await addMeal(today, type, item);
    if (!res.ok) return res.error;
    setMeals((prev) => [...prev, res.data]);
    return null;
  };

  const handleDelete = async (id: string) => {
    setActionError(null);
    const err = await deleteMeal(id);
    if (err) setActionError(err);
    else setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  // Hold the screen until the real targets and meals arrive so wrong numbers never flash.
  if ((!loaded && !loadError) || (loading && meals.length === 0 && !error)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={CalcuColors.teal} size="large" />
      </View>
    );
  }

  const totals = sumMacros(meals);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      showsVerticalScrollIndicator={false}
    >
      <DailyGoalBanner
        remaining={Math.max(0, profile.calorieTarget - totals.calories)}
        visible={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
      />

      <QuickScan onAddMeal={handleAddMeal} />

      <CalorieRing consumed={totals.calories} target={profile.calorieTarget} />

      <MacroCard
        protein={{ consumed: totals.protein, target: profile.proteinTarget }}
        carbs={{ consumed: totals.carbs, target: profile.carbsTarget }}
        fat={{ consumed: totals.fat, target: profile.fatTarget }}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={reload} loading={loading}>
            Retry
          </Button>
        </View>
      ) : (
        <MealList meals={meals} onDelete={handleDelete} />
      )}
      {actionError && <Text style={[styles.errorText, styles.actionError]}>{actionError}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CalcuColors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CalcuColors.background,
  },
  errorBox: { margin: 16, gap: 12 },
  errorText: { color: '#EF4444', fontSize: 14 },
  actionError: { marginHorizontal: 16, marginTop: 8 },
});
