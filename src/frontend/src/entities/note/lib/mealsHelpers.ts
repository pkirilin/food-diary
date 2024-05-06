import { MealType } from '../model';

const AVAILABLE_MEALS: Map<MealType, string> = new Map<MealType, string>([
  [MealType.Breakfast, 'Breakfast'],
  [MealType.SecondBreakfast, 'Second breakfast'],
  [MealType.Lunch, 'Lunch'],
  [MealType.AfternoonSnack, 'Afternoon snack'],
  [MealType.Dinner, 'Dinner'],
]);

export const getMealTypes = (): MealType[] => Array.from(AVAILABLE_MEALS.keys());

export const getMealName = (mealType: MealType): string => {
  const mealName = AVAILABLE_MEALS.get(mealType);

  if (!mealName) {
    throw new Error(`Meal type = '${mealType}' doesn't exist`);
  }

  return mealName;
};
