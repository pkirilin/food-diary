import { type productModel } from '@/entities/product';
import { noteModel } from '..';
import { type NoteItem, noteApi } from '../api';
import { type GetNotesByMealsResponse } from './mealsHelpers';

const EMPTY_NUTRITION_VALUES: productModel.NutritionValues = {
  calories: 0,
  protein: null,
  fats: null,
  carbs: null,
  sugar: null,
  salt: null,
};

const selectNotes = (
  response: GetNotesByMealsResponse,
  mealType: noteModel.MealType | null = null,
): NoteItem[] => (mealType != null ? response[mealType] : Object.values(response).flat());

export const useNutritionValues = (
  date: string,
  mealType: noteModel.MealType | null = null,
): productModel.NutritionValues =>
  noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ data }) =>
        data
          ? noteModel.calculateNutritionValues(selectNotes(data, mealType))
          : EMPTY_NUTRITION_VALUES,
    },
  );
