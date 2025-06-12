import { type NoteItem } from '../api';
import { noteModel } from '.';

export const calculateCalories = (notes: NoteItem[]): number =>
  notes.reduce((sum, note) => sum + noteModel.calculateCalories(note), 0);
