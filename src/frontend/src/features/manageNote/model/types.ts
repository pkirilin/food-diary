import { type RecognizeNoteItem } from '@/entities/note';
import { type productModel } from '@/entities/product';
import { type ClientError } from '@/shared/api';
import { type NoteFormValues } from './noteSchema';

export interface Image {
  id: string;
  name: string;
  base64: string;
}

export interface NoteRecognitionState {
  suggestions: RecognizeNoteItem[];
  isLoading: boolean;
  error?: ClientError;
}

interface ProductSearchScreenState {
  type: 'product-search';
}

interface NoteInputScreenState {
  type: 'note-input';
  formId: 'note-form';
  note: NoteFormValues;
}

interface ProductInputScreenState {
  type: 'product-input';
  formId: 'product-form';
  product: productModel.ProductFormValues;
}

interface ImageUploadScreenState {
  type: 'image-upload';
  images: Image[];
}

export type ManageNoteScreenState =
  | ProductSearchScreenState
  | NoteInputScreenState
  | ProductInputScreenState
  | ImageUploadScreenState;
