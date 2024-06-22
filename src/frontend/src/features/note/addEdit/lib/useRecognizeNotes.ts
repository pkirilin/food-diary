import { useCallback, useMemo } from 'react';
import { noteApi, type RecognizeNoteItem } from '@/entities/note';
import { isProblemDetailsError, type ProblemDetails } from '@/shared/api';

type FetchFn = (file: File) => Promise<void>;

export interface RecognizeNotesResult {
  notes: RecognizeNoteItem[];
  isLoading: boolean;
  isSuccess: boolean;
  error?: ProblemDetails;
}

export const useRecognizeNotes = (): [FetchFn, RecognizeNotesResult] => {
  const [recognizeNotes, { data, error, isLoading, isSuccess, isError }] =
    noteApi.useRecognizeMutation();

  const fetch = useCallback<FetchFn>(
    async file => {
      const formData = new FormData();
      formData.append('files', file);
      await recognizeNotes(formData);
    },
    [recognizeNotes],
  );

  const result = useMemo<RecognizeNotesResult>(
    () => ({
      isLoading,
      isSuccess,
      notes: data?.notes ?? [],
      error: isError && isProblemDetailsError(error) ? error.data : undefined,
    }),
    [data, error, isError, isLoading, isSuccess],
  );

  return [fetch, result];
};
