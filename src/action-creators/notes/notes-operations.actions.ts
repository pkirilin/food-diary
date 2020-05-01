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
} from '../../action-types';
import { NoteCreateEdit, MealType, NoteDeleteRequest } from '../../models';
import { createNoteAsync, editNoteAsync, deleteNoteAsync } from '../../services';
import { NoteEditRequest } from '../../models';
import { readBadRequestResponseAsync } from '../../utils/bad-request-response-reader';

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

enum NotesOperationsBaseErrorMessages {
  Create = 'Failed to create note',
  Edit = 'Failed to update note',
  Delete = 'Failed to delete note',
}

export const createNote: CreateNoteActionCreator = (note: NoteCreateEdit) => {
  return async (dispatch: Dispatch<CreateNoteActions>): Promise<CreateNoteSuccessAction | CreateNoteErrorAction> => {
    dispatch(createNoteRequest(note, 'Creating note'));
    try {
      const response = await createNoteAsync(note);

      if (response.ok) {
        return dispatch(createNoteSuccess(note.mealType));
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${NotesOperationsBaseErrorMessages.Create}: ${badRequestResponse}`);
          return dispatch(
            createNoteError(note.mealType, `${NotesOperationsBaseErrorMessages.Create}: ${badRequestResponse}`),
          );
        case 500:
          alert(`${NotesOperationsBaseErrorMessages.Create}: server error`);
          return dispatch(createNoteError(note.mealType, `${NotesOperationsBaseErrorMessages.Create}: server error`));
        default:
          alert(`${NotesOperationsBaseErrorMessages.Create}: unknown response code`);
          return dispatch(
            createNoteError(note.mealType, `${NotesOperationsBaseErrorMessages.Create}: unknown response code`),
          );
      }
    } catch (error) {
      alert(NotesOperationsBaseErrorMessages.Create);
      return dispatch(createNoteError(note.mealType, NotesOperationsBaseErrorMessages.Create));
    }
  };
};

export const editNote: EditNoteActionCreator = (request: NoteEditRequest) => {
  return async (dispatch: Dispatch<EditNoteActions>): Promise<EditNoteSuccessAction | EditNoteErrorAction> => {
    dispatch(editNoteRequest(request, 'Updating note'));
    try {
      const response = await editNoteAsync(request);

      if (response.ok) {
        return dispatch(editNoteSuccess(request.mealType));
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${NotesOperationsBaseErrorMessages.Edit}: ${badRequestResponse}`);
          return dispatch(
            editNoteError(request.mealType, `${NotesOperationsBaseErrorMessages.Edit}: ${badRequestResponse}`),
          );
        case 500:
          alert(`${NotesOperationsBaseErrorMessages.Edit}: server error`);
          return dispatch(editNoteError(request.mealType, `${NotesOperationsBaseErrorMessages.Edit}: server error`));
        default:
          alert(`${NotesOperationsBaseErrorMessages.Edit}: unknown response code`);
          return dispatch(
            editNoteError(request.mealType, `${NotesOperationsBaseErrorMessages.Edit}: unknown response code`),
          );
      }
    } catch (error) {
      alert(NotesOperationsBaseErrorMessages.Edit);
      return dispatch(editNoteError(request.mealType, NotesOperationsBaseErrorMessages.Edit));
    }
  };
};

export const deleteNote: DeleteNoteActionCreator = (request: NoteDeleteRequest) => {
  return async (dispatch: Dispatch<DeleteNoteActions>): Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction> => {
    dispatch(deleteNoteRequest(request, 'Deleting note'));
    try {
      const response = await deleteNoteAsync(request.id);

      if (response.ok) {
        return dispatch(deleteNoteSuccess(request.mealType));
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${NotesOperationsBaseErrorMessages.Delete}: ${badRequestResponse}`);
          return dispatch(
            deleteNoteError(request.mealType, `${NotesOperationsBaseErrorMessages.Delete}: ${badRequestResponse}`),
          );
        case 500:
          alert(`${NotesOperationsBaseErrorMessages.Delete}: server error`);
          return dispatch(
            deleteNoteError(request.mealType, `${NotesOperationsBaseErrorMessages.Delete}: server error`),
          );
        default:
          alert(`${NotesOperationsBaseErrorMessages.Delete}: unknown response code`);
          return dispatch(
            deleteNoteError(request.mealType, `${NotesOperationsBaseErrorMessages.Delete}: unknown response code`),
          );
      }
    } catch (error) {
      alert(NotesOperationsBaseErrorMessages.Delete);
      return dispatch(deleteNoteError(request.mealType, NotesOperationsBaseErrorMessages.Delete));
    }
  };
};
