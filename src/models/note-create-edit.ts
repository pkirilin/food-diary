import { MealType } from './meal-types';

export interface NoteCreateEdit {
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}
