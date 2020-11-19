import { NotesOperationsActionTypes } from '../../action-types';
import { NoteCreateEdit, NoteDeleteRequest } from '../../models';
import { NoteEditRequest } from '../../models';
import { createErrorResponseHandler, createAsyncAction } from '../../helpers';
import { API_URL } from '../../config';
import { readBadRequestResponseAsync } from '../../utils';

export const createNote = createAsyncAction<
  {},
  NoteCreateEdit,
  NotesOperationsActionTypes.CreateRequest,
  NotesOperationsActionTypes.CreateSuccess,
  NotesOperationsActionTypes.CreateError
>(
  NotesOperationsActionTypes.CreateRequest,
  NotesOperationsActionTypes.CreateSuccess,
  NotesOperationsActionTypes.CreateError,
  {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'POST',
    constructBody: (note): string => JSON.stringify(note),
    onError: createErrorResponseHandler('Failed to create note', {
      400: response => readBadRequestResponseAsync(response),
    }),
  },
  'Creating note',
);

export const editNote = createAsyncAction<
  {},
  NoteEditRequest,
  NotesOperationsActionTypes.EditRequest,
  NotesOperationsActionTypes.EditSuccess,
  NotesOperationsActionTypes.EditError
>(
  NotesOperationsActionTypes.EditRequest,
  NotesOperationsActionTypes.EditSuccess,
  NotesOperationsActionTypes.EditError,
  {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'PUT',
    constructBody: ({ note }): string => JSON.stringify(note),
    onError: createErrorResponseHandler('Failed to update note', {
      400: response => readBadRequestResponseAsync(response),
    }),
  },
  'Updating note',
);

export const deleteNote = createAsyncAction<
  {},
  NoteDeleteRequest,
  NotesOperationsActionTypes.DeleteRequest,
  NotesOperationsActionTypes.DeleteSuccess,
  NotesOperationsActionTypes.DeleteError
>(
  NotesOperationsActionTypes.DeleteRequest,
  NotesOperationsActionTypes.DeleteSuccess,
  NotesOperationsActionTypes.DeleteError,
  {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'DELETE',
    modifyUrl: (baseUrl, { id }): string => `${baseUrl}/${id}`,
    onError: createErrorResponseHandler('Failed to delete note', {
      400: response => readBadRequestResponseAsync(response),
    }),
  },
  'Deleting note',
);
