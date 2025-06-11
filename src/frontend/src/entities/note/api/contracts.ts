import { type MealType } from '../model';

export interface GetNotesRequest {
  date: string;
}

export interface GetNotesResponse {
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
  product: Product;
}

interface Product {
  id: number;
  name: string;
  defaultQuantity: number;
  calories: number;
  protein: number | null;
  fats: number | null;
  carbs: number | null;
  sugar: number | null;
  salt: number | null;
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

export interface NoteRequestBody {
  date: string;
  mealType: MealType;
  productId: number;
  productQuantity: number;
  displayOrder: number;
}

export interface UpdateNoteRequest {
  id: number;
  note: NoteRequestBody;
}

export interface RecognizeProductItem {
  name: string;
  caloriesCost: number;
  protein: number | null;
  fats: number | null;
  carbs: number | null;
  sugar: number | null;
  salt: number | null;
}

export interface RecognizeNoteItem {
  product: RecognizeProductItem;
  quantity: number;
}

export interface RecognizeNoteResponse {
  notes: RecognizeNoteItem[];
}
