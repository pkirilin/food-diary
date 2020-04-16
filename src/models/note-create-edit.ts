import { MealType } from './meal-item';

export interface NoteCreateEdit {
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
}
