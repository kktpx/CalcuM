import { MD3LightTheme } from 'react-native-paper';

export const CalcuColors = {
  // Primary
  teal: '#0D9488',
  emerald: '#34D399',
  
  // Backgrounds
  background: '#FAFAFA',
  card: '#FFFFFF',
  
  // Text
  textPrimary: '#18181B',
  textSecondary: '#71717A',
  textMuted: '#A1A1AA',
  
  // Borders
  border: '#F4F4F5',
  borderMedium: '#E4E4E7',
  
  // Macros
  protein: '#F43F5E',    // rose-500
  carbs: '#F59E0B',      // amber-500
  fat: '#0EA5E9',        // sky-500
  
  // Macro backgrounds (pastel)
  proteinBg: '#FFF1F2',  // rose-50
  carbsBg: '#FFFBEB',    // amber-50
  fatBg: '#F0F9FF',      // sky-50
  
  // Ring
  ringBackground: '#E4E4E7',
  
  // Quick Scan gradient
  gradientStart: '#14B8A6',  // teal-500
  gradientEnd: '#10B981',    // emerald-500
} as const;

export const CalcuTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: CalcuColors.teal,
    primaryContainer: '#CCFBF1',   // teal-100
    secondary: CalcuColors.emerald,
    background: CalcuColors.background,
    surface: CalcuColors.card,
    surfaceVariant: '#F4F4F5',
    onSurface: CalcuColors.textPrimary,
    onSurfaceVariant: CalcuColors.textSecondary,
    outline: CalcuColors.border,
    elevation: {
      level0: 'transparent',
      level1: CalcuColors.card,
      level2: CalcuColors.card,
      level3: CalcuColors.card,
      level4: CalcuColors.card,
      level5: CalcuColors.card,
    },
  },
};
