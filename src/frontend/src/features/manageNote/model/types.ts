import { type RecognizeNoteItem } from '@/entities/note';
import { type ClientError } from '@/shared/api';

export interface Image {
  name: string;
  base64: string;
}

export interface NoteRecognitionState {
  suggestions: RecognizeNoteItem[];
  isLoading: boolean;
  error?: ClientError;
}
