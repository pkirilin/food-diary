import { type MealType } from '../models';

export interface GetNotesRequest {
  pageId: number;
  mealType?: MealType;
}

export interface CreateNoteRequest {
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}

export interface EditNoteRequest {
  id: number;
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}
