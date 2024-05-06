import { type productModel } from '@/entities/product';
import { type MealType } from '../model';

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

export interface NoteCreateEdit {
  mealType: MealType;
  pageId: number;
  product: productModel.AutocompleteOptionType;
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
