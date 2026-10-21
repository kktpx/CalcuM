import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CalcuColors } from '../theme/theme';
import { mockScanResult } from '../data/mockData';

interface QuickScanProps {
  onAddMeal: (meal: any) => void;
}

export function QuickScan({ onAddMeal }: QuickScanProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePress = () => {
    setIsScanning(true);
    setResult(null);
    
    // Simulate analyzing process
    setTimeout(() => {
      setIsScanning(false);
      setResult(mockScanResult);
    }, 1800);
  };

  const handleClose = () => {
    setResult(null);
  };

  const handleAdd = () => {
    onAddMeal({
      id: Date.now().toString(),
      type: 'Snack',
      name: result.name,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
    });
    setResult(null);
  };

  if (result) {
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={styles.resultServing}>{result.servingSize}</Text>
          </View>
          <TouchableOpacity onPress={handleClose}>
            <MaterialCommunityIcons name="close" size={24} color={CalcuColors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.macrosGrid}>
          <View style={styles.macroCol}>
            <Text style={[styles.macroVal, { color: CalcuColors.teal }]}>{result.calories}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.macroVal, { color: CalcuColors.protein }]}>{result.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.macroVal, { color: CalcuColors.carbs }]}>{result.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.macroVal, { color: CalcuColors.fat }]}>{result.fat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add to Foods</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} disabled={isScanning} style={styles.container}>
      <LinearGradient
        colors={[CalcuColors.gradientStart, CalcuColors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {isScanning ? (
          <View style={styles.contentRow}>
            <ActivityIndicator color="#FFFFFF" size="large" style={{ marginRight: 8 }} />
            <Text style={styles.titleText}>Analyzing...</Text>
          </View>
        ) : (
          <View style={styles.contentRow}>
            <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
            <View style={styles.textCol}>
              <Text style={styles.titleText}>Quick Scan</Text>
              <Text style={styles.subtitleText}>Upload a food photo</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    height: 72,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textCol: {
    flexDirection: 'column',
  },
  titleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 12,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginLeft: 12,
  },
  resultCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: CalcuColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CalcuColors.borderMedium,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '700',
    color: CalcuColors.textPrimary,
  },
  resultServing: {
    fontSize: 14,
    color: CalcuColors.textSecondary,
    marginTop: 2,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroCol: {
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: 12,
    color: CalcuColors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: CalcuColors.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
