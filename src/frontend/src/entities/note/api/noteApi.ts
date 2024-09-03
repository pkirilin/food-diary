import {
  type UpdateNoteRequest,
  type GetNotesRequest,
  type RecognizeNoteResponse,
  type GetNotesHistoryRequest,
  type GetNotesResponse,
  type GetNotesHistoryResponse,
  type NoteRequestBody,
} from '@/entities/note';
import { api } from '@/shared/api';
import { createUrl } from '@/shared/lib';

export const noteApi = api.injectEndpoints({
  endpoints: builder => ({
    notes: builder.query<GetNotesResponse, GetNotesRequest>({
      query: ({ date }) => `/api/v1/notes?date=${date}`,
      providesTags: (_response, _error, { date }) => [{ type: 'note', id: date }],
    }),

    notesHistory: builder.query<GetNotesHistoryResponse, GetNotesHistoryRequest>({
      query: request => createUrl('/api/v1/notes/history', { ...request }),
      providesTags: ['note'],
    }),

    createNote: builder.mutation<void, NoteRequestBody>({
      query: request => ({
        method: 'POST',
        url: '/api/v1/notes',
        body: request,
      }),
      invalidatesTags: ['note', 'page'],
    }),

    updateNote: builder.mutation<void, UpdateNoteRequest>({
      query: ({ id, note }) => ({
        method: 'PUT',
        url: `/api/v1/notes/${id}`,
        body: note,
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

    recognize: builder.mutation<RecognizeNoteResponse, FormData>({
      query: body => ({
        method: 'POST',
        url: `/api/v1/notes/recognitions`,
        body,
      }),
    }),
  }),
});
