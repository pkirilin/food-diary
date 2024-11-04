import { type NoteItem } from '@/entities/note';

export const getNextDisplayOrder = (notes: NoteItem[]): number =>
  notes.reduce((max, note) => (note.displayOrder > max ? note.displayOrder : max), -1) + 1;
