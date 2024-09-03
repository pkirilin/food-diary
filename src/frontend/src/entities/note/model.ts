export enum MealType {
  Breakfast = 1,
  SecondBreakfast = 2,
  Lunch = 3,
  AfternoonSnack = 4,
  Dinner = 5,
}

export interface FormValues {
  date: string;
  mealType: MealType;
  displayOrder: number;
  quantity: number;
}
