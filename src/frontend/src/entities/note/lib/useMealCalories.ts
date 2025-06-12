import { noteModel } from '..';
import { noteApi } from '../api';
import { type MealType } from '../model';

export const useMealCalories = (date: string, mealType: MealType): number => {
  const { mealCalories } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ data }) => ({
        mealCalories: data ? noteModel.calculateTotalCalories(data[mealType]) : 0,
      }),
    },
  );

  return mealCalories;
};
