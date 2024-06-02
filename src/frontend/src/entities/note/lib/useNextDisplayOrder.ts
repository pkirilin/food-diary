import { noteApi } from '../api';
import { type NoteItem } from '../model';

const getMaxDisplayOrder = (notes: NoteItem[]): number =>
  notes.reduce(
    (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
    -1,
  );

export const useNextDisplayOrder = (pageId: number): number => {
  const { nextDisplayOrder } = noteApi.useGetNotesQuery(
    { pageId },
    {
      selectFromResult: ({ data: notes, isSuccess }) => ({
        nextDisplayOrder: isSuccess ? getMaxDisplayOrder(notes) + 1 : 0,
      }),
    },
  );

  return nextDisplayOrder;
};
