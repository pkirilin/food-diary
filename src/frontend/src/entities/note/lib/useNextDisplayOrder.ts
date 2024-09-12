import { useMemo } from 'react';
import { type NoteItem } from '../api';

export const useNextDisplayOrder = (notes: NoteItem[]): number =>
  useMemo(
    () =>
      notes.reduce(
        (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
        -1,
      ) + 1,
    [notes],
  );
