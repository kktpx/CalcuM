import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CalcuColors } from '../theme/theme';
import { analyzeFood } from '../lib/api';
import { MEAL_TYPES, MealType, ScanResult, defaultMealType } from '../lib/nutrition';

interface QuickScanProps {
  /** Resolves to an error message, or null when the meal was saved. */
  onAddMeal: (type: MealType, item: ScanResult) => Promise<string | null>;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  base64: true,
  quality: 0.5,
  allowsEditing: false,
};

export function QuickScan({ onAddMeal }: QuickScanProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [mealType, setMealType] = useState<MealType>(defaultMealType());
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const analyze = async (picked: ImagePicker.ImagePickerResult) => {
    if (picked.canceled) return;
    const asset = picked.assets[0];
    if (!asset?.base64) {
      setError('Could not read that photo. Please try another one.');
      return;
    }
    setIsScanning(true);
    try {
      const res = await analyzeFood(asset.base64, asset.mimeType ?? 'image/jpeg');
      if (res.ok) {
        setResult(res.data);
        setMealType(defaultMealType());
      } else {
        setError(res.error);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const fromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Camera access is off. Enable it in Settings, or choose a photo from your library.');
      return;
    }
    await analyze(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  };

  const fromLibrary = async () => {
    await analyze(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  };

  const handlePress = () => {
    setError(null);
    setResult(null);
    Alert.alert('Quick Scan', 'Add a photo of your food', [
      { text: 'Take photo', onPress: fromCamera },
      { text: 'Choose from library', onPress: fromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleClose = () => {
    setResult(null);
  };

  const handleAdd = async () => {
    if (!result || adding) return;
    setAdding(true);
    try {
      const err = await onAddMeal(mealType, result);
      if (err) setError(err);
      else {
        setError(null);
        setResult(null);
      }
    } finally {
      setAdding(false);
    }
  };

  if (result) {
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={styles.resultServing}>{result.servingSize}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} accessibilityLabel="Dismiss scan result">
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

        <View style={styles.typeRow}>
          {MEAL_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setMealType(t)}
              style={[styles.typeChip, mealType === t && styles.typeChipActive]}
            >
              <Text style={[styles.typeChipText, mealType === t && styles.typeChipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={[styles.addButton, adding && { opacity: 0.6 }]} onPress={handleAdd} disabled={adding}>
          {adding ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add to {mealType}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
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
      {error && <Text style={[styles.errorText, { marginHorizontal: 16, marginTop: 8 }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CalcuColors.borderMedium,
  },
  typeChipActive: {
    backgroundColor: CalcuColors.teal,
    borderColor: CalcuColors.teal,
  },
  typeChipText: {
    fontSize: 13,
    color: CalcuColors.textSecondary,
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
  },
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
