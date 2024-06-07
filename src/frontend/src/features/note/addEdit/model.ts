import { type ReactElement } from 'react';
import { type noteModel } from '@/entities/note';
import { type productModel } from '@/entities/product';

export type DialogStateType = 'note' | 'product';

export interface DialogState {
  type: DialogStateType;
  title: string;
  submitText: string;
  submitLoading: boolean;
  submitDisabled: boolean;
  cancelDisabled: boolean;
  formId: string;
  content: ReactElement;
  onClose: () => void;
}

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
