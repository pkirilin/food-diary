import {
  CreateNoteSuccessAction,
  CreateNoteErrorAction,
  CreateNoteRequestAction,
  NotesOperationsActionTypes,
  EditNoteRequestAction,
  EditNoteSuccessAction,
  EditNoteErrorAction,
  DeleteNoteSuccessAction,
  DeleteNoteErrorAction,
  DeleteNoteRequestAction,
} from '../../action-types';
import { NoteCreateEdit, NoteDeleteRequest } from '../../models';
import { NoteEditRequest } from '../../models';
import { createErrorResponseHandler, createThunkWithApiCall } from '../../helpers';
import { API_URL } from '../../config';

export const createNote = createThunkWithApiCall<
  CreateNoteRequestAction,
  CreateNoteSuccessAction,
  CreateNoteErrorAction,
  NotesOperationsActionTypes.CreateRequest,
  NotesOperationsActionTypes.CreateSuccess,
  NotesOperationsActionTypes.CreateError,
  {},
  NoteCreateEdit
>({
  makeRequest: () => {
    return (note): CreateNoteRequestAction => ({
      type: NotesOperationsActionTypes.CreateRequest,
      requestMessage: 'Creating note',
      payload: note,
    });
  },
  makeSuccess: () => {
    return ({ mealType }): CreateNoteSuccessAction => ({
      type: NotesOperationsActionTypes.CreateSuccess,
      data: {},
      mealType,
    });
  },
  makeError: () => {
    return ({ mealType }, receivedErrorMessage): CreateNoteErrorAction => ({
      type: NotesOperationsActionTypes.CreateError,
      errorMessage: receivedErrorMessage,
      mealType,
    });
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'POST',
    constructBody: (note): string => JSON.stringify(note),
    onError: createErrorResponseHandler('Failed to create note'),
  },
});

export const editNote = createThunkWithApiCall<
  EditNoteRequestAction,
  EditNoteSuccessAction,
  EditNoteErrorAction,
  NotesOperationsActionTypes.EditRequest,
  NotesOperationsActionTypes.EditSuccess,
  NotesOperationsActionTypes.EditError,
  {},
  NoteEditRequest
>({
  makeRequest: () => {
    return (noteEditRequest): EditNoteRequestAction => ({
      type: NotesOperationsActionTypes.EditRequest,
      requestMessage: 'Updating note',
      payload: noteEditRequest,
    });
  },
  makeSuccess: () => {
    return ({ note }): EditNoteSuccessAction => ({
      type: NotesOperationsActionTypes.EditSuccess,
      data: {},
      mealType: note.mealType,
    });
  },
  makeError: () => {
    return ({ note }, receivedErrorMessage): EditNoteErrorAction => ({
      type: NotesOperationsActionTypes.EditError,
      errorMessage: receivedErrorMessage,
      mealType: note.mealType,
    });
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'PUT',
    constructBody: ({ note }): string => JSON.stringify(note),
    onError: createErrorResponseHandler('Failed to update note'),
  },
});

export const deleteNote = createThunkWithApiCall<
  DeleteNoteRequestAction,
  DeleteNoteSuccessAction,
  DeleteNoteErrorAction,
  NotesOperationsActionTypes.DeleteRequest,
  NotesOperationsActionTypes.DeleteSuccess,
  NotesOperationsActionTypes.DeleteError,
  {},
  NoteDeleteRequest
>({
  makeRequest: () => {
    return (deleteNoteRequest): DeleteNoteRequestAction => {
      if (!deleteNoteRequest) {
        throw new Error('Failed to delete note: deleteNoteRequest is undefined');
      }

      return {
        type: NotesOperationsActionTypes.DeleteRequest,
        requestMessage: 'Deleting note',
        payload: deleteNoteRequest,
      };
    };
  },
  makeSuccess: () => {
    return ({ mealType }): DeleteNoteSuccessAction => ({
      type: NotesOperationsActionTypes.DeleteSuccess,
      data: {},
      mealType,
    });
  },
  makeError: () => {
    return ({ mealType }, receivedErrorMessage): DeleteNoteErrorAction => ({
      type: NotesOperationsActionTypes.DeleteError,
      errorMessage: receivedErrorMessage ?? '',
      mealType,
    });
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/notes`,
    method: 'DELETE',
    modifyUrl: (baseUrl, { id }): string => `${baseUrl}/${id}`,
    onError: createErrorResponseHandler('Failed to delete note'),
  },
});
