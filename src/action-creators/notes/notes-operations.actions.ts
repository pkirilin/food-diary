import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  CreateNoteSuccessAction,
  CreateNoteErrorAction,
  CreateNoteRequestAction,
  NotesOperationsActionTypes,
} from '../../action-types';
import { NoteCreateEdit, MealType } from '../../models';
import { createNoteAsync } from '../../services';

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
