import { api } from 'src/api';
import { createUrl } from 'src/utils';
import { type NoteItem } from '../models';
import { type EditNoteRequest, type CreateNoteRequest, type GetNotesRequest } from './contracts';

export const notesApi = api.injectEndpoints({
  endpoints: builder => ({
    getNotes: builder.query<NoteItem[], GetNotesRequest>({
      query: request => createUrl('/api/v1/notes', { ...request }),
      providesTags: ['note'],
    }),

    createNote: builder.mutation<void, CreateNoteRequest>({
      query: request => ({
        method: 'POST',
        url: '/api/v1/notes',
        body: request,
      }),
      invalidatesTags: ['note', 'page'],
    }),

    editNote: builder.mutation<void, EditNoteRequest>({
      query: ({ id, ...request }) => ({
        method: 'PUT',
        url: `/api/v1/notes/${id}`,
        body: request,
      }),
      invalidatesTags: ['note', 'page'],
    }),

    deleteNote: builder.mutation<void, number>({
      query: id => ({
        method: 'DELETE',
        url: `/api/v1/notes/${id}`,
      }),
      invalidatesTags: ['note', 'page'],
    }),
  }),
});
