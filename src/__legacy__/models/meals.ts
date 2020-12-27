export enum MealType {
  Breakfast = 1,
  SecondBreakfast = 2,
  Lunch = 3,
  AfternoonSnack = 4,
  Dinner = 5,
}

export const availableMeals = new Map<MealType, string>([
  [MealType.Breakfast, 'Breakfast'],
  [MealType.SecondBreakfast, 'Second breakfast'],
  [MealType.Lunch, 'Lunch'],
  [MealType.AfternoonSnack, 'Afternoon snack'],
  [MealType.Dinner, 'Dinner'],
]);

export const availableMealTypes = Array.from(availableMeals.keys());
