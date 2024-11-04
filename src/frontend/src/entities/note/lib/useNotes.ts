import { type NoteItem, noteApi } from '../api';

interface Result {
  data: NoteItem[];
  isFetching: boolean;
  isChanged: boolean;
}

export const useNotes = (date: string): Result =>
  noteApi.useNotesQuery(
    {
      date,
    },
    {
      selectFromResult: ({ data, isFetching, isSuccess }) => ({
        data: isSuccess ? Object.values(data).flat() : [],
        isFetching,
        isChanged: !isFetching && isSuccess,
      }),
    },
  );
