import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useTabBarInset } from '../components/BottomTabBar';
import { DailyGoalBanner } from '../components/DailyGoalBanner';
import { QuickScan } from '../components/QuickScan';
import { CalorieRing } from '../components/CalorieRing';
import { MacroCard } from '../components/MacroCard';
import { MealList } from '../components/MealList';
import { mockConsumed, mockMeals, Meal } from '../data/mockData';
import { CalcuColors } from '../theme/theme';
import { useProfile } from '../hooks/useProfile';

// Intake not covered by the initially logged meals; totals = base + current meals
const sumInitial = (key: 'calories' | 'protein' | 'carbs' | 'fat') =>
  mockMeals.reduce((acc, m) => acc + m[key], 0);
const baseConsumed = {
  calories: mockConsumed.calories - sumInitial('calories'),
  protein: mockConsumed.protein - sumInitial('protein'),
  carbs: mockConsumed.carbs - sumInitial('carbs'),
  fat: mockConsumed.fat - sumInitial('fat'),
};

export function DashboardScreen() {
  const { profile, loaded, loadError } = useProfile();
  const bottomInset = useTabBarInset();
  const targets = {
    calories: profile.calorieTarget,
    protein: profile.proteinTarget,
    carbs: profile.carbsTarget,
    fat: profile.fatTarget,
  };
  const [bannerVisible, setBannerVisible] = useState(true);
  const [meals, setMeals] = useState(mockMeals);
  
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const currentConsumed = baseConsumed.calories + totals.calories;
  const currentProtein = baseConsumed.protein + totals.protein;
  const currentCarbs = baseConsumed.carbs + totals.carbs;
  const currentFat = baseConsumed.fat + totals.fat;

  const handleAddMeal = (newMeal: Meal) => {
    setMeals((prev) => [...prev, newMeal]);
  };

  // Hold the screen until the real targets arrive so wrong numbers never flash.
  if (!loaded && !loadError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={CalcuColors.teal} size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomInset }]}
      showsVerticalScrollIndicator={false}
    >
      <DailyGoalBanner 
        remaining={Math.max(0, targets.calories - currentConsumed)} 
        visible={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
      />
      
      <QuickScan onAddMeal={handleAddMeal} />
      
      <CalorieRing 
        consumed={currentConsumed} 
        target={targets.calories} 
      />
      
      <MacroCard 
        protein={{ consumed: currentProtein, target: targets.protein }}
        carbs={{ consumed: currentCarbs, target: targets.carbs }}
        fat={{ consumed: currentFat, target: targets.fat }}
      />
      
      <MealList meals={meals} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CalcuColors.background,
  },
  contentContainer: {},
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CalcuColors.background,
  },
});
