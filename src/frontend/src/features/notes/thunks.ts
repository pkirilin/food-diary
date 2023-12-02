import { API_URL } from 'src/config';
import { createApiCallAsyncThunk, createUrl, handleEmptyResponse } from '../__shared__/utils';
import { type MealType, type NoteCreateEdit, type NoteItem } from './models';

export interface GetNotesRequest {
  pageId: number;
  mealType?: MealType;
}

export interface NoteOperationPayload {
  mealType: MealType;
}

export interface CreateNotePayload extends NoteOperationPayload {
  note: NoteCreateEdit;
}

export interface EditNotePayload extends NoteOperationPayload {
  id: number;
  note: NoteCreateEdit;
}

export interface DeleteNotePayload extends NoteOperationPayload {
  id: number;
}

export const getNotes = createApiCallAsyncThunk<NoteItem[], GetNotesRequest>(
  'notes/getNotes',
  request => createUrl(`${API_URL}/api/v1/notes`, { ...request }),
  async response => await response.json(),
  'Failed to get notes',
);

export const createNote = createApiCallAsyncThunk<void, CreateNotePayload>(
  'notes/createNote',
  () => `${API_URL}/api/v1/notes`,
  handleEmptyResponse,
  'Failed to create note',
  {
    method: 'POST',
    bodyCreator: ({ note }) => JSON.stringify(note),
  },
);

export const editNote = createApiCallAsyncThunk<void, EditNotePayload>(
  'notes/editNote',
  ({ id }) => `${API_URL}/api/v1/notes/${id}`,
  handleEmptyResponse,
  'Failed to update note',
  {
    method: 'PUT',
    bodyCreator: ({ note }) => JSON.stringify(note),
  },
);

export const deleteNote = createApiCallAsyncThunk<void, DeleteNotePayload>(
  'notes/deleteNote',
  ({ id }) => `${API_URL}/api/v1/notes/${id}`,
  handleEmptyResponse,
  'Failed to delete note',
  {
    method: 'DELETE',
  },
);
