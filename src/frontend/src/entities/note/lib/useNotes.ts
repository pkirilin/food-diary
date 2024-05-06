import { noteApi } from '../api/noteApi';
import { type NoteItem } from '../model';

interface Result {
  data: NoteItem[];
  isFetching: boolean;
  isChanged: boolean;
}

export const useNotes = (pageId: number): Result => {
  return noteApi.useGetNotesQuery(
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
