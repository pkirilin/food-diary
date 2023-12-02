import { MealType } from './models';

const AVAILABLE_MEALS: Map<MealType, string> = new Map<MealType, string>([
  [MealType.Breakfast, 'Breakfast'],
  [MealType.SecondBreakfast, 'Second breakfast'],
  [MealType.Lunch, 'Lunch'],
  [MealType.AfternoonSnack, 'Afternoon snack'],
  [MealType.Dinner, 'Dinner'],
]);

export const get = (): MealType[] => Array.from(AVAILABLE_MEALS.keys());

export const getName = (mealType: MealType): string => {
  const mealName = AVAILABLE_MEALS.get(mealType);

  if (!mealName) {
    throw new Error(`Meal type = '${mealType}' doesn't exist`);
  }

  return mealName;
};
