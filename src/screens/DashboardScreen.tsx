import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { DailyGoalBanner } from '../components/DailyGoalBanner';
import { QuickScan } from '../components/QuickScan';
import { CalorieRing } from '../components/CalorieRing';
import { MacroCard } from '../components/MacroCard';
import { MealList } from '../components/MealList';
import { mockTargets, mockConsumed, mockMeals, Meal } from '../data/mockData';
import { CalcuColors } from '../theme/theme';

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

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <DailyGoalBanner 
        remaining={Math.max(0, mockTargets.calories - currentConsumed)} 
        visible={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
      />
      
      <QuickScan onAddMeal={handleAddMeal} />
      
      <CalorieRing 
        consumed={currentConsumed} 
        target={mockTargets.calories} 
      />
      
      <MacroCard 
        protein={{ consumed: currentProtein, target: mockTargets.protein }}
        carbs={{ consumed: currentCarbs, target: mockTargets.carbs }}
        fat={{ consumed: currentFat, target: mockTargets.fat }}
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
  contentContainer: {
    paddingBottom: 100, // Safe padding for Bottom Tab
  },
});
