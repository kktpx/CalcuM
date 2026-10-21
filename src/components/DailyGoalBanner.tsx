import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner } from 'react-native-paper';
import { CalcuColors } from '../theme/theme';

interface DailyGoalBannerProps {
  remaining: number;
  visible: boolean;
  onDismiss: () => void;
}

export function DailyGoalBanner({ remaining, visible, onDismiss }: DailyGoalBannerProps) {
  return (
    <View style={styles.container}>
      <Banner
        visible={visible}
        actions={[
          {
            label: 'Dismiss',
            onPress: onDismiss,
            textColor: CalcuColors.teal,
          },
        ]}
        icon="target"
        style={styles.banner}
      >
        🎯 Daily Goal{'\n'}
        You have {remaining} kcal remaining today.
      </Banner>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  banner: {
    backgroundColor: '#CCFBF1', // teal-100
    borderRadius: 16, // Extra fallback
  },
});
