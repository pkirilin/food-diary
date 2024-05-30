import { noteApi } from '../api';
import { type MealType, type NoteItem } from '../model';

const calculateNextDisplayOrder = (notes: NoteItem[], mealType: MealType): number =>
  notes
    .filter(n => n.mealType === mealType)
    .reduce((maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder), -1) +
  1;

export const useNextDisplayOrder = (pageId: number, mealType: MealType): number => {
  const { nextDisplayOrder } = noteApi.useGetNotesQuery(
    { pageId },
    {
      selectFromResult: ({ data: notes, isSuccess }) => ({
        nextDisplayOrder: isSuccess ? calculateNextDisplayOrder(notes, mealType) : 0,
      }),
    },
  );

  return nextDisplayOrder;
};
