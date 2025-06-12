import { noteModel } from '..';
import { noteApi } from '../api';

export const useTotalCalories = (date: string): number => {
  const { totalCalories } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ data }) => ({
        totalCalories: data ? noteModel.calculateTotalCalories(Object.values(data).flat()) : 0,
      }),
    },
  );

  return totalCalories;
};
