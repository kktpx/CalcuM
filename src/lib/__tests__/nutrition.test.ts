import {
  defaultMealType,
  localDateString,
  parseScanResult,
  sumMacros,
  validateFoodForm,
  validateWeight,
} from '../nutrition';

test('sumMacros adds every field and handles empty', () => {
  expect(sumMacros([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  expect(
    sumMacros([
      { calories: 420, protein: 28, carbs: 40, fat: 14 },
      { calories: 620, protein: 32, carbs: 78, fat: 18 },
    ])
  ).toEqual({ calories: 1040, protein: 60, carbs: 118, fat: 32 });
});

test('localDateString uses local calendar date, zero padded', () => {
  expect(localDateString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
});

test.each([
  [6, 'Breakfast'],
  [12, 'Lunch'],
  [18, 'Dinner'],
  [23, 'Snack'],
  [2, 'Snack'],
])('defaultMealType at hour %i is %s', (hour, expected) => {
  expect(defaultMealType(new Date(2026, 0, 5, hour))).toBe(expected);
});

test('parseScanResult accepts a good result and rounds numbers', () => {
  expect(
    parseScanResult({ name: ' Chicken Rice ', servingSize: '1 plate', calories: 619.6, protein: 32, carbs: 78, fat: 18 })
  ).toEqual({ name: 'Chicken Rice', servingSize: '1 plate', calories: 620, protein: 32, carbs: 78, fat: 18 });
});

test.each([
  null,
  'text',
  { name: '', servingSize: '', calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: 'x', calories: 'a' },
  { name: 'x', servingSize: '1', calories: -5, protein: 0, carbs: 0, fat: 0 },
])('parseScanResult rejects %j', (raw) => {
  expect(parseScanResult(raw)).toBeNull();
});

test('validateFoodForm', () => {
  expect(validateFoodForm({ name: 'Egg', serving: '', calories: '70', protein: '6', carbs: '', fat: '5' })).toEqual({
    ok: true,
    food: { name: 'Egg', serving: '1 serving', calories: 70, protein: 6, carbs: 0, fat: 5 },
  });
  expect(validateFoodForm({ name: ' ', serving: '', calories: '70', protein: '', carbs: '', fat: '' }).ok).toBe(false);
  expect(validateFoodForm({ name: 'Egg', serving: '', calories: '', protein: '', carbs: '', fat: '' }).ok).toBe(false);
  expect(validateFoodForm({ name: 'Egg', serving: '', calories: '70', protein: '-1', carbs: '', fat: '' }).ok).toBe(false);
  expect(validateFoodForm({ name: 'Egg', serving: '', calories: '99999', protein: '', carbs: '', fat: '' }).ok).toBe(false);
});

test('validateWeight accepts one decimal, comma or dot', () => {
  expect(validateWeight('72.5')).toBe(72.5);
  expect(validateWeight('72,5')).toBe(72.5);
  expect(validateWeight('72')).toBe(72);
  expect(validateWeight('abc')).toBeNull();
  expect(validateWeight('10')).toBeNull();
  expect(validateWeight('600')).toBeNull();
  expect(validateWeight('')).toBeNull();
});
