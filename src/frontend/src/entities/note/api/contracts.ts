import { type FileItem } from '@/shared/api';
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

export interface EditNoteRequest {
  id: number;
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}

export interface RecognizeNoteRequest {
  files: FileItem[];
}

export interface RecognizeNoteItem {
  calories: number;
  productName: string;
  productQuantity: number;
  productCaloriesCost: number;
}

export interface RecognizeNoteResponse {
  notes: RecognizeNoteItem[];
}
