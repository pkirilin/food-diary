import { type RecognizeNoteItem } from '@/entities/note';
import { type ClientError } from '@/shared/api';
import { type NoteFormValues } from './noteSchema';
import { type ProductFormValues } from './productSchema';

export interface Image {
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
  product: ProductFormValues;
}

interface ImageUploadScreenState {
  type: 'image-upload';
  image: Image;
}

export type ManageNoteScreenState =
  | ProductSearchScreenState
  | NoteInputScreenState
  | ProductInputScreenState
  | ImageUploadScreenState;
