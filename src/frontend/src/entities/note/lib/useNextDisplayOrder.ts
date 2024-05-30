import { noteApi } from '../api';
import { type MealType, type NoteItem } from '../model';

const calculateNextDisplayOrder = (notes: NoteItem[]): number =>
  notes.reduce(
    (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
    -1,
  ) + 1;

export const useNextDisplayOrder = (pageId: number, mealType: MealType): number => {
  const { nextDisplayOrder } = noteApi.useGetNotesQuery(
    { pageId, mealType },
    {
      selectFromResult: ({ data, isSuccess }) => ({
        nextDisplayOrder: isSuccess ? calculateNextDisplayOrder(data) : 0,
      }),
    },
  );

  return nextDisplayOrder;
};
