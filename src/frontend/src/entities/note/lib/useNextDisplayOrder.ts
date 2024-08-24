import { noteApi } from '../api';
import { type NoteItem } from '../model';

const getMaxDisplayOrder = (notes: NoteItem[]): number =>
  notes.reduce(
    (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
    -1,
  );

export const useNextDisplayOrder = (date: string): number => {
  const { nextDisplayOrder } = noteApi.useNotesByDateQuery(
    { date },
    {
      selectFromResult: ({ data, isSuccess }) => ({
        nextDisplayOrder: isSuccess ? getMaxDisplayOrder(data.notes) + 1 : 0,
      }),
    },
  );

  return nextDisplayOrder;
};
