import { Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  GetNotesForPageSuccessAction,
  GetNotesForPageErrorAction,
  GetNotesForPageRequestAction,
  NotesListActionTypes,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
  GetNotesForMealRequestAction,
  SetEditableForNoteAction,
} from '../../action-types';
import { getNotesForPageAsync, getNotesForMealAsync } from '../../services';
import { NotesForPage, MealType, NotesForMealRequest, MealItem } from '../../models';

const getNotesForPageRequest = (): GetNotesForPageRequestAction => {
  return {
    type: NotesListActionTypes.RequestForPage,
  };
};

const getNotesForPageSuccess = (notesForPage: NotesForPage): GetNotesForPageSuccessAction => {
  return {
    type: NotesListActionTypes.SuccessForPage,
    notesForPage: notesForPage,
  };
};

const getNotesForPageError = (errorMessage: string): GetNotesForPageErrorAction => {
  return {
    type: NotesListActionTypes.ErrorForPage,
    errorMessage,
  };
};

const getNotesForMealRequest = (mealType: MealType): GetNotesForMealRequestAction => {
  return {
    type: NotesListActionTypes.RequestForMeal,
    mealType,
  };
};

const getNotesForMealSuccess = (mealItem: MealItem): GetNotesForMealSuccessAction => {
  return {
    type: NotesListActionTypes.SuccessForMeal,
    mealItem,
  };
};

const getNotesForMealError = (mealType: MealType, errorMessage: string): GetNotesForMealErrorAction => {
  return {
    type: NotesListActionTypes.ErrorForMeal,
    mealType,
    errorMessage,
  };
};

export const getNotesForPage: ActionCreator<ThunkAction<
  Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction>,
  NotesForPage,
  number,
  GetNotesForPageSuccessAction | GetNotesForPageErrorAction
>> = (pageId: number) => {
  return async (dispatch: Dispatch): Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction> => {
    dispatch(getNotesForPageRequest());
    try {
      const response = await getNotesForPageAsync(pageId);
      if (!response.ok) {
        return dispatch(getNotesForPageError('Notes for page response error'));
      }

      const notesForPage = await response.json();
      return dispatch(getNotesForPageSuccess(notesForPage));
    } catch (error) {
      return dispatch(getNotesForPageError('Failed to get notes for page from server'));
    }
  };
};

export const getNotesForMeal: ActionCreator<ThunkAction<
  Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction>,
  MealItem,
  NotesForMealRequest,
  GetNotesForMealSuccessAction | GetNotesForMealErrorAction
>> = (request: NotesForMealRequest) => {
  return async (dispatch: Dispatch): Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction> => {
    dispatch(getNotesForMealRequest(request.mealType));
    try {
      const response = await getNotesForMealAsync(request);
      if (!response.ok) {
        return dispatch(getNotesForMealError(request.mealType, 'Notes for meal response error'));
      }

      const mealItem = await response.json();
      return dispatch(getNotesForMealSuccess(mealItem));
    } catch (error) {
      return dispatch(getNotesForMealError(request.mealType, 'Failed to get notes for meal from server'));
    }
  };
};

export const setEditableForNote = (noteId: number, editable: boolean): SetEditableForNoteAction => {
  return {
    type: NotesListActionTypes.SetEditable,
    noteId,
    editable,
  };
};
