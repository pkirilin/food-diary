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
import { getNotesAsync } from '../../services';
import { NoteItem, MealType, NotesForMealSearchRequest, NotesSearchRequest } from '../../models';

const getNotesForPageRequest = (): GetNotesForPageRequestAction => {
  return {
    type: NotesListActionTypes.RequestForPage,
  };
};

const getNotesForPageSuccess = (noteItems: NoteItem[]): GetNotesForPageSuccessAction => {
  return {
    type: NotesListActionTypes.SuccessForPage,
    noteItems,
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

const getNotesForMealSuccess = (mealType: MealType, noteItems: NoteItem[]): GetNotesForMealSuccessAction => {
  return {
    type: NotesListActionTypes.SuccessForMeal,
    mealType,
    noteItems,
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
  NoteItem[],
  NotesSearchRequest,
  GetNotesForPageSuccessAction | GetNotesForPageErrorAction
>> = (request: NotesSearchRequest) => {
  return async (dispatch: Dispatch): Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction> => {
    dispatch(getNotesForPageRequest());
    try {
      const response = await getNotesAsync(request);
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
  NoteItem[],
  NotesForMealSearchRequest,
  GetNotesForMealSuccessAction | GetNotesForMealErrorAction
>> = ({ pageId, mealType }: NotesForMealSearchRequest) => {
  return async (dispatch: Dispatch): Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction> => {
    dispatch(getNotesForMealRequest(mealType));
    try {
      const response = await getNotesAsync({
        pageId,
        mealType,
      });
      if (!response.ok) {
        return dispatch(getNotesForMealError(mealType, 'Notes for meal response error'));
      }

      const mealItem = await response.json();
      return dispatch(getNotesForMealSuccess(mealType, mealItem));
    } catch (error) {
      return dispatch(getNotesForMealError(mealType, 'Failed to get notes for meal from server'));
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
