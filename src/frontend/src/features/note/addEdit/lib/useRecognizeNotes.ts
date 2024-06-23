import { useCallback, useMemo } from 'react';
import { noteApi, type RecognizeNoteItem } from '@/entities/note';
import { parseClientError, type ClientError } from '@/shared/api';

type FetchFn = (file: File) => Promise<void>;

export interface RecognizeNotesResult {
  notes: RecognizeNoteItem[];
  isLoading: boolean;
  isSuccess: boolean;
  error?: ClientError;
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
      error: isError ? parseClientError(error) : undefined,
    }),
    [data, error, isError, isLoading, isSuccess],
  );

  return [fetch, result];
};
