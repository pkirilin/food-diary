import { noteApi } from '../api';
import { notesListModel } from '../model';

export const useTotalCalories = (date: string): number => {
  const { totalCalories } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ data }) => ({
        totalCalories: data ? notesListModel.calculateCalories(Object.values(data).flat()) : 0,
      }),
    },
  );

  return totalCalories;
};
