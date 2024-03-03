import { notesApi } from '../api';
import { type NoteItem } from '../models';

interface Result {
  data: NoteItem[];
  isFetching: boolean;
  isChanged: boolean;
}

export const useNotes = (pageId: number): Result => {
  return notesApi.useGetNotesQuery(
    {
      pageId,
    },
    {
      selectFromResult: ({ data, isFetching, isSuccess }) => ({
        data: data ?? [],
        isFetching,
        isChanged: !isFetching && isSuccess,
      }),
    },
  );
};
