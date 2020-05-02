import { MealType } from './meals';

export interface NoteItem {
  id: number;
  mealType: MealType;
  displayOrder: number;
  productId: number;
  productName: string;
  productQuantity: number;
  calories: number;
}

export interface NoteCreateEdit {
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}

export interface NotesSearchRequest {
  pageId: number;
  mealType?: MealType;
}

export interface NotesForMealSearchRequest extends NotesSearchRequest {
  mealType: MealType;
}

export interface NoteEditRequest extends NoteCreateEdit {
  id: number;
}

export interface NoteDeleteRequest {
  id: number;
  mealType: MealType;
}
