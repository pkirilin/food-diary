import { MealType } from './meal-types';

export interface NoteDeleteRequest {
  id: number;
  mealType: MealType;
}
