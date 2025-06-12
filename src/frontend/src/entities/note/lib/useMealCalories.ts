import { noteApi } from '../api';
import { notesListModel, type MealType } from '../model';

export const useMealCalories = (date: string, mealType: MealType): number => {
  const { mealCalories } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ data }) => ({
        mealCalories: data ? notesListModel.calculateCalories(data[mealType]) : 0,
      }),
    },
  );

  return mealCalories;
};
