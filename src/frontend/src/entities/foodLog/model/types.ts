export enum MealType {
  Breakfast = 'Breakfast',
  SecondBreakfast = 'SecondBreakfast',
  Lunch = 'Lunch',
  AfternoonSnack = 'AfternoonSnack',
  Dinner = 'Dinner',
}

export interface MealDraftProduct {
  id: number;
  name: string;
  defaultQuantity: number;
  // The nutrition values are per 100 g
  calories: number;
  protein: number | null;
  fats: number | null;
  carbs: number | null;
  sugar: number | null;
  salt: number | null;
}

export interface MealDraftFoodLog {
  product: MealDraftProduct;
  quantity: number;
}

export interface MealDraft {
  date: string;
  mealType: MealType;
  foodLogs: MealDraftFoodLog[];
}
