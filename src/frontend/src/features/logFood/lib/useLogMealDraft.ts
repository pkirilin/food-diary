import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { noteApi } from '@/entities/note';
import { type ClientError, parseClientError } from '@/shared/api';
import { toCreateNotesRequest } from './mapping';

interface LogMealDraftResult {
  isLogging: boolean;
  error: ClientError | null;
  logMealDraft: (mealDraft: foodLogModel.MealDraft) => Promise<void>;
}

export const useLogMealDraft = (onLogged: (date: string) => void): LogMealDraftResult => {
  const dispatch = useAppDispatch();
  const [createNotes, { isLoading, isError, error }] = noteApi.useCreateNotesMutation();

  const logMealDraft = async (mealDraft: foodLogModel.MealDraft): Promise<void> => {
    const result = await createNotes(toCreateNotesRequest(mealDraft));

    if ('error' in result) {
      return;
    }

    dispatch(foodLogModel.actions.mealDraftLogged());
    onLogged(mealDraft.date);
  };

  return {
    isLogging: isLoading,
    error: isError ? parseClientError(error) : null,
    logMealDraft,
  };
};
