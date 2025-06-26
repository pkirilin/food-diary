import { type NoteItem, noteApi } from '../api';
import { type MealType } from '../model';
import { type GetNotesByMealsResponse } from './mealsHelpers';

interface Result {
  data: NoteItem[];
  isFetching: boolean;
  isChanged: boolean;
}

const selectNotes = (
  response: GetNotesByMealsResponse,
  mealType: MealType | null = null,
): NoteItem[] => (mealType != null ? response[mealType] : Object.values(response).flat());

export const useNotes = (date: string, mealType: MealType | null = null): Result =>
  noteApi.useNotesQuery(
    {
      date,
    },
    {
      selectFromResult: ({ data, isFetching, isSuccess }) => ({
        data: data ? selectNotes(data, mealType) : [],
        isFetching,
        isChanged: !isFetching && isSuccess,
      }),
    },
  );
