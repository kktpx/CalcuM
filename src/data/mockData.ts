export const mockUser = {
  name: 'Kittipat S.',
  initials: 'KS',
};

export const mockTargets = {
  calories: 2000,
  protein: 150,  // grams
  carbs: 250,    // grams
  fat: 65,       // grams
};

export const mockConsumed = {
  calories: 1150,
  protein: 70,
  carbs: 120,
  fat: 45,
};

export interface Meal {
  id: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const mockMeals: Meal[] = [
  { id: '1', type: 'Breakfast', name: 'Chicken Sandwich', calories: 420, protein: 28, carbs: 40, fat: 14 },
  { id: '2', type: 'Lunch', name: 'Chicken Rice', calories: 620, protein: 32, carbs: 78, fat: 18 },
];

export const mockScanResult = {
  name: 'Chicken Rice',
  servingSize: '1 serving',
  calories: 620,
  protein: 32,
  carbs: 78,
  fat: 18,
};

export const mockNotificationCount = 3;
