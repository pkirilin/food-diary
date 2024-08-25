import { type MealType } from '../model';

export interface GetNotesByDateRequest {
  date: string;
}

export interface GetNotesByDateResponse {
  notes: NoteItem[];
}

export interface NoteItem {
  id: number;
  date: string;
  mealType: MealType;
  displayOrder: number;
  productId: number;
  productName: string;
  productQuantity: number;
  productDefaultQuantity: number;
  calories: number;
}

export interface GetNotesHistoryRequest {
  from: string;
  to: string;
}

export interface GetNotesHistoryResponse {
  notesHistory: NoteHistoryItem[];
}

export interface NoteHistoryItem {
  date: string;
  caloriesCount: number;
}

export interface CreateNoteRequest {
  date: string;
  mealType: MealType;
  productId: number;
  productQuantity: number;
  displayOrder: number;
}

export interface UpdateNoteRequest {
  id: number;
  date: string;
  mealType: MealType;
  productId: number;
  productQuantity: number;
  displayOrder: number;
}

export interface RecognizeProductItem {
  name: string;
  caloriesCost: number;
}

export interface RecognizeNoteItem {
  product: RecognizeProductItem;
  quantity: number;
}

export interface RecognizeNoteResponse {
  notes: RecognizeNoteItem[];
}
