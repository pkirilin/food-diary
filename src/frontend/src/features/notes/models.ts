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
  calories: number;
}

export interface NoteCreateEdit {
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}

export * as Meals from './meals';
