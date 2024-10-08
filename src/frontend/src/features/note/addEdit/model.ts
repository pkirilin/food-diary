import { type noteModel } from '@/entities/note';
import { type productModel } from '@/entities/product';

export type InputMethod = 'fromInput' | 'fromPhoto';

export interface Note {
  date: string;
  mealType: noteModel.MealType;
  product: productModel.AutocompleteOption;
  productQuantity: number;
  displayOrder: number;
}

export interface UploadedPhoto {
  src: string;
  name: string;
  file: File;
}
