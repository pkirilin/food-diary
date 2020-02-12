import { MealType } from './meal-item';

export interface NoteCreateEdit {
  id: number;
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
}
