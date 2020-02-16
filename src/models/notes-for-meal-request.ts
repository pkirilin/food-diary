import { MealType } from './meal-item';

export interface NotesForMealRequest {
  pageId: number;
  mealType: MealType;
}
