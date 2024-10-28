import { useMemo } from 'react';
import { type NoteItem } from '../api';

export const calculateCalories = (notes: NoteItem[]): number =>
  notes.reduce((sum, note) => sum + note.calories, 0);

export const useCalories = (notes: NoteItem[]): number =>
  useMemo(() => calculateCalories(notes), [notes]);
