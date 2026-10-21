import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalcuColors } from '../theme/theme';

interface MacroBarsProps {
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
}

export function MacroCard({ protein, carbs, fat }: MacroBarsProps) {
  const renderMacro = (
    label: string, 
    data: { consumed: number; target: number }, 
    color: string, 
    bgColor: string
  ) => {
    const percentage = data.target > 0 ? Math.min((data.consumed / data.target) * 100, 100) : 0;

    return (
      <View style={styles.macroColumn}>
        <Text style={[styles.macroLabel, { color }]}>{label}</Text>
        <Text style={styles.macroValue}>
          {data.consumed}/{data.target}g
        </Text>
        
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill, 
              { backgroundColor: color, width: `${percentage}%` }
            ]} 
          />
        </View>
        
        <Text style={styles.macroPercentage}>{Math.round(percentage)}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {renderMacro('Protein', protein, CalcuColors.protein, CalcuColors.proteinBg)}
        {renderMacro('Carbs', carbs, CalcuColors.carbs, CalcuColors.carbsBg)}
        {renderMacro('Fat', fat, CalcuColors.fat, CalcuColors.fatBg)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  macroColumn: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    padding: 12,
  },
  macroLabel: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 13,
    color: CalcuColors.textPrimary,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: CalcuColors.borderMedium,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroPercentage: {
    fontSize: 12,
    color: CalcuColors.textSecondary,
    fontWeight: '500',
  },
});
