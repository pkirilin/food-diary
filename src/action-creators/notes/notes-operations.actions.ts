import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
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
import { NoteCreateEdit, MealType } from '../../models';
import { createNoteAsync, editNoteAsync, deleteNoteAsync } from '../../services';

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

const editNoteRequest = (note: NoteCreateEdit, operationMessage: string): EditNoteRequestAction => {
  return {
    type: NotesOperationsActionTypes.EditRequest,
    note,
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

const deleteNoteRequest = (noteId: number, mealType: MealType, operationMessage: string): DeleteNoteRequestAction => {
  return {
    type: NotesOperationsActionTypes.DeleteRequest,
    noteId,
    mealType,
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

export const createNote: ActionCreator<ThunkAction<
  Promise<CreateNoteSuccessAction | CreateNoteErrorAction>,
  void,
  NoteCreateEdit,
  CreateNoteSuccessAction | CreateNoteErrorAction
>> = (note: NoteCreateEdit) => {
  return async (dispatch: Dispatch): Promise<CreateNoteSuccessAction | CreateNoteErrorAction> => {
    dispatch(createNoteRequest(note, 'Creating note'));

    try {
      const response = await createNoteAsync(note);
      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to create note (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(createNoteError(note.mealType, errorMessageForInvalidData));
      }
      return dispatch(createNoteSuccess(note.mealType));
    } catch (error) {
      const errorMessageForServerError = 'Failed to create note (server error)';
      alert(errorMessageForServerError);
      return dispatch(createNoteError(note.mealType, errorMessageForServerError));
    }
  };
};

export const editNote: ActionCreator<ThunkAction<
  Promise<EditNoteSuccessAction | EditNoteErrorAction>,
  void,
  NoteCreateEdit,
  EditNoteSuccessAction | EditNoteErrorAction
>> = (note: NoteCreateEdit) => {
  return async (dispatch: Dispatch): Promise<EditNoteSuccessAction | EditNoteErrorAction> => {
    dispatch(editNoteRequest(note, 'Updating note'));

    try {
      const response = await editNoteAsync(note);
      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to update note (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(editNoteError(note.mealType, errorMessageForInvalidData));
      }
      return dispatch(editNoteSuccess(note.mealType));
    } catch (error) {
      const errorMessageForServerError = 'Failed to update note (server error)';
      alert(errorMessageForServerError);
      return dispatch(editNoteError(note.mealType, errorMessageForServerError));
    }
  };
};

export const deleteNote: ActionCreator<ThunkAction<
  Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction>,
  void,
  [number, MealType],
  DeleteNoteSuccessAction | DeleteNoteErrorAction
>> = ([noteId, mealType]: [number, MealType]) => {
  return async (dispatch: Dispatch): Promise<DeleteNoteSuccessAction | DeleteNoteErrorAction> => {
    dispatch(deleteNoteRequest(noteId, mealType, 'Deleting note'));

    try {
      const response = await deleteNoteAsync(noteId);
      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to delete note (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(deleteNoteError(mealType, errorMessageForInvalidData));
      }
      return dispatch(deleteNoteSuccess(mealType));
    } catch (error) {
      const errorMessageForServerError = 'Failed to delete note (server error)';
      alert(errorMessageForServerError);
      return dispatch(deleteNoteError(mealType, errorMessageForServerError));
    }
  };
};
