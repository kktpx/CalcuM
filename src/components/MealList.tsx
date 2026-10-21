import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalcuColors } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Meal {
  id: string;
  type: string;
  name: string;
  calories: number;
}

interface MealListProps {
  meals: Meal[];
}

export function MealList({ meals }: MealListProps) {
  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return 'egg-fried';
      case 'lunch': return 'food-variant';
      case 'dinner': return 'pot-steam';
      case 'snack': return 'cookie';
      default: return 'food';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Meals</Text>
      
      <View style={styles.card}>
        {meals.length === 0 ? (
          <Text style={styles.emptyText}>No meals logged today.</Text>
        ) : (
          meals.map((meal, index) => (
            <View key={meal.id}>
              <View style={styles.mealRow}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons 
                    name={getIconForType(meal.type)} 
                    size={24} 
                    color={CalcuColors.teal} 
                  />
                </View>
                
                <View style={styles.mealInfo}>
                  <Text style={styles.mealType}>{meal.type}</Text>
                  <Text style={styles.mealName}>{meal.name}</Text>
                </View>
                
                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              </View>
              
              {index < meals.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CalcuColors.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: CalcuColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CalcuColors.borderMedium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    color: CalcuColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDFA', // teal-50
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 13,
    color: CalcuColors.textSecondary,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: CalcuColors.textPrimary,
  },
  mealCalories: {
    fontSize: 15,
    fontWeight: '600',
    color: CalcuColors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: CalcuColors.borderMedium,
    marginVertical: 8,
  },
});
