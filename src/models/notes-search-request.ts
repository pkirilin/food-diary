import { MealType } from './meal-types';

export interface NotesSearchRequest {
  pageId: number;
  mealType?: MealType;
}

export interface NotesForMealSearchRequest extends NotesSearchRequest {
  mealType: MealType;
}
