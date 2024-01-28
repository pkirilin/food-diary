import { api } from 'src/api';
import { createUrl } from 'src/utils';
import { type NoteItem } from '../models';
import { type GetNotesRequest } from './contracts';

export const notesApi = api.injectEndpoints({
  endpoints: builder => ({
    getNotes: builder.query<NoteItem[], GetNotesRequest>({
      query: request => createUrl('/api/v1/notes', { ...request }),
      providesTags: ['note'],
    }),
  }),
});
