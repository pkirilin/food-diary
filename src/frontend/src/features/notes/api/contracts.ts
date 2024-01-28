import { type MealType } from '../models';

export interface GetNotesRequest {
  pageId: number;
  mealType?: MealType;
}
