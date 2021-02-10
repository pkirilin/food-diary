import config from '../__shared__/config';
import { createApiCallAsyncThunk, createUrl, handleEmptyResponse } from '../__shared__/utils';
import { MealType, NoteCreateEdit, NoteItem } from './models';

export type GetNotesRequest = {
  pageId: number;
  mealType?: MealType;
};

export type EditNoteRequest = {
  id: number;
  note: NoteCreateEdit;
};

export const getNotes = createApiCallAsyncThunk<NoteItem[], GetNotesRequest>(
  'notes/getNotes',
  params => createUrl(`${config.apiUrl}/v1/notes`, params),
  response => response.json(),
  'Failed to get notes',
);

export const createNote = createApiCallAsyncThunk<void, NoteCreateEdit>(
  'notes/createNote',
  () => `${config.apiUrl}/v1/notes`,
  handleEmptyResponse,
  'Failed to create note',
  {
    method: 'POST',
    bodyCreator: note => JSON.stringify(note),
  },
);

export const editNote = createApiCallAsyncThunk<void, EditNoteRequest>(
  'notes/editNote',
  ({ id }) => `${config.apiUrl}/v1/notes/${id}`,
  handleEmptyResponse,
  'Failed to update note',
  {
    method: 'PUT',
    bodyCreator: ({ note }) => JSON.stringify(note),
  },
);

export const deleteNote = createApiCallAsyncThunk<void, number>(
  'notes/deleteNote',
  id => `${config.apiUrl}/v1/notes/${id}`,
  handleEmptyResponse,
  'Failed to delete note',
  {
    method: 'DELETE',
  },
);
