import { Dispatch } from 'redux';
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
  CreateNoteActionCreator,
  CreateNoteActions,
  EditNoteActionCreator,
  EditNoteActions,
  DeleteNoteActionCreator,
  DeleteNoteActions,
  OpenModalAction,
} from '../../action-types';
import { NoteCreateEdit, MealType, NoteDeleteRequest, ErrorReason } from '../../models';
import { createNoteAsync, editNoteAsync, deleteNoteAsync } from '../../services';
import { NoteEditRequest } from '../../models';
import { readBadRequestResponseAsync } from '../../utils/bad-request-response-reader';
import { openMessageModal } from '../modal-actions';

const createNoteRequest = (note: NoteCreateEdit, operationMessage: string): CreateNoteRequestAction => {
  return {
    type: NotesOperationsActionTypes.CreateRequest,
    note,
    operationMessage,
  };
};

const createNoteError = (mealType: MealType, error: string): CreateNoteErrorAction => {
  return {
    type: NotesOperationsActionTypes.CreateError,
    mealType,
    error,
  };
};

const createNoteSuccess = (mealType: MealType): CreateNoteSuccessAction => {
  return {
    type: NotesOperationsActionTypes.CreateSuccess,
    mealType,
  };
};

const editNoteRequest = (request: NoteEditRequest, operationMessage: string): EditNoteRequestAction => {
  return {
    type: NotesOperationsActionTypes.EditRequest,
    request,
    operationMessage,
  };
};

const editNoteSuccess = (mealType: MealType): EditNoteSuccessAction => {
  return {
    type: NotesOperationsActionTypes.EditSuccess,
    mealType,
  };
};

const editNoteError = (mealType: MealType, error: string): EditNoteErrorAction => {
  return {
    type: NotesOperationsActionTypes.EditError,
    mealType,
    error,
  };
};

const deleteNoteRequest = (request: NoteDeleteRequest, operationMessage: string): DeleteNoteRequestAction => {
  return {
    type: NotesOperationsActionTypes.DeleteRequest,
    request,
    operationMessage,
  };
};

const deleteNoteSuccess = (mealType: MealType): DeleteNoteSuccessAction => {
  return {
    type: NotesOperationsActionTypes.DeleteSuccess,
    mealType,
  };
};

const deleteNoteError = (mealType: MealType, error: string): DeleteNoteErrorAction => {
  return {
    type: NotesOperationsActionTypes.DeleteError,
    mealType,
    error,
  };
};

enum NotesOperationsErrorMessages {
  Create = 'Failed to create note',
  Edit = 'Failed to update note',
  Delete = 'Failed to delete note',
}

export const createNote: CreateNoteActionCreator = (note: NoteCreateEdit) => {
  return async (
    dispatch: Dispatch<CreateNoteActions | OpenModalAction>,
  ): Promise<CreateNoteSuccessAction | CreateNoteErrorAction> => {
    dispatch(createNoteRequest(note, 'Creating note'));
    try {
      const response = await createNoteAsync(note);

      if (response.ok) {
        return dispatch(createNoteSuccess(note.mealType));
      }

      let errorMessage = `${NotesOperationsErrorMessages.Create}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(createNoteError(note.mealType, errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', NotesOperationsErrorMessages.Create));
      return dispatch(createNoteError(note.mealType, NotesOperationsErrorMessages.Create));
    }
  };
};

export const editNote: EditNoteActionCreator = (request: NoteEditRequest) => {
  return async (
    dispatch: Dispatch<EditNoteActions | OpenModalAction>,
  ): Promise<EditNoteSuccessAction | EditNoteErrorAction> => {
    dispatch(editNoteRequest(request, 'Updating note'));
    try {
      const response = await editNoteAsync(request);

      if (response.ok) {
        return dispatch(editNoteSuccess(request.note.mealType));
      }

      let errorMessage = `${NotesOperationsErrorMessages.Edit}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(editNoteError(request.note.mealType, errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', NotesOperationsErrorMessages.Edit));
      return dispatch(editNoteError(request.note.mealType, NotesOperationsErrorMessages.Edit));
    }
  };
};

export const deleteNote: DeleteNoteActionCreator = (request: NoteDeleteRequest) => {
  return async (
    dispatch: Dispatch<DeleteNoteActions | OpenModalAction>,
  ): Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction> => {
    dispatch(deleteNoteRequest(request, 'Deleting note'));
    try {
      const response = await deleteNoteAsync(request.id);

      if (response.ok) {
        return dispatch(deleteNoteSuccess(request.mealType));
      }

      let errorMessage = `${NotesOperationsErrorMessages.Delete}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(deleteNoteError(request.mealType, errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', NotesOperationsErrorMessages.Delete));
      return dispatch(deleteNoteError(request.mealType, NotesOperationsErrorMessages.Delete));
    }
  };
};
