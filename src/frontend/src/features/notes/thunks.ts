import { API_URL } from 'src/config';
import { createApiCallAsyncThunk, handleEmptyResponse } from '../__shared__/utils';
import { type MealType, type NoteCreateEdit } from './models';

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
