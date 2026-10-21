import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { CalcuColors } from '../theme/theme';

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const remaining = Math.max(target - consumed, 0);

  const radius = 80;
  const strokeWidth = 12;
  const size = 200;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.card}>
      <View style={styles.ringContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={CalcuColors.teal} />
              <Stop offset="100%" stopColor={CalcuColors.emerald} />
            </LinearGradient>
          </Defs>
          
          {/* Background circle */}
          <Circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            fill="none" 
            stroke={CalcuColors.ringBackground} 
            strokeWidth={strokeWidth} 
          />
          
          {/* Progress circle */}
          <Circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            fill="none"
            stroke="url(#ringGrad)" 
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        <View style={styles.centerTextContainer}>
          <Text style={styles.consumedText}>{consumed.toLocaleString()}</Text>
          <Text style={styles.targetText}>/ {target.toLocaleString()} kcal</Text>
        </View>
      </View>
      
      <Text style={styles.remainingText}>
        Remaining: <Text style={styles.remainingValue}>{remaining.toLocaleString()} kcal</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CalcuColors.card,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CalcuColors.borderMedium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ringContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumedText: {
    fontSize: 32,
    fontWeight: '800',
    color: CalcuColors.textPrimary,
  },
  targetText: {
    fontSize: 16,
    color: CalcuColors.textSecondary,
    marginTop: 4,
  },
  remainingText: {
    fontSize: 16,
    color: CalcuColors.textSecondary,
    marginTop: 16,
  },
  remainingValue: {
    color: CalcuColors.teal,
    fontWeight: '700',
  },
});
