import { useMemo } from 'react';
import { type NoteItem } from '../api';

export const useCalories = (notes: NoteItem[]): number =>
  useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);
