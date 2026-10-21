import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CalcuColors } from '../theme/theme';

interface PlaceholderScreenProps {
  title: string;
  icon: string;
}

export function PlaceholderScreen({ title, icon }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon as any} size={64} color={CalcuColors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Coming soon to mobile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CalcuColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: CalcuColors.textPrimary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: CalcuColors.textSecondary,
    marginTop: 8,
  },
});
