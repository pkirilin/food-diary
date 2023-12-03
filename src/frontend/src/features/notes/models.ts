export enum MealType {
  Breakfast = 1,
  SecondBreakfast = 2,
  Lunch = 3,
  AfternoonSnack = 4,
  Dinner = 5,
}

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

export interface NoteItem {
  id: number;
  mealType: MealType;
  displayOrder: number;
  productId: number;
  productName: string;
  productQuantity: number;
  calories: number;
}

export interface NoteCreateEdit {
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}
