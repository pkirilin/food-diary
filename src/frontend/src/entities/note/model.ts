export enum MealType {
  Breakfast = 1,
  SecondBreakfast = 2,
  Lunch = 3,
  AfternoonSnack = 4,
  Dinner = 5,
}

export interface NoteItem {
  id: number;
  mealType: MealType;
  displayOrder: number;
  productId: number;
  productName: string;
  productQuantity: number;
  productDefaultQuantity: number;
  calories: number;
}

export interface FormValues {
  pageId: number;
  mealType: MealType;
  displayOrder: number;
  quantity: number;
}
