import {
  type UpdateNoteRequest,
  type CreateNoteRequest,
  type GetNotesByDateRequest,
  type RecognizeNoteResponse,
  type GetNotesAggregatedRequest,
  type GetNotesByDateResponse,
  type GetNotesAggregatedResponse,
  type noteModel,
  type GetNotesRequest,
} from '@/entities/note';
import { api } from '@/shared/api';
import { createUrl } from '@/shared/lib';

export const noteApi = api.injectEndpoints({
  endpoints: builder => ({
    getNotes: builder.query<noteModel.NoteItem[], GetNotesRequest>({
      query: request => createUrl('/api/v1/notes', { ...request }),
      providesTags: ['note'],
    }),

    notesByDate: builder.query<GetNotesByDateResponse, GetNotesByDateRequest>({
      query: ({ date }) => `/api/v1/notes/${date}`,
      providesTags: ['note'],
    }),

    notesAggregated: builder.query<GetNotesAggregatedResponse, GetNotesAggregatedRequest>({
      query: request => createUrl('/api/v1/notes/aggregated', { ...request }),
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

    updateNote: builder.mutation<void, UpdateNoteRequest>({
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

    recognize: builder.mutation<RecognizeNoteResponse, FormData>({
      query: body => ({
        method: 'POST',
        url: `/api/v1/notes/recognitions`,
        body,
      }),
    }),
  }),
});
