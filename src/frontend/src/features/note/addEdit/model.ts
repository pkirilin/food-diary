import { type noteModel } from '@/entities/note';
import { type productModel } from '@/entities/product';

export type InputMethod = 'fromInput' | 'fromPhoto';

export interface Note {
  mealType: noteModel.MealType;
  pageId: number;
  product: productModel.AutocompleteOption;
  productQuantity: number;
  displayOrder: number;
}

export interface UploadedPhoto {
  src: string;
  name: string;
  file: File;
}
