import { Dispatch } from 'redux';
import {
  GetNotesForPageSuccessAction,
  GetNotesForPageErrorAction,
  GetNotesForPageRequestAction,
  NotesListActionTypes,
  GetNotesForMealSuccessAction,
  GetNotesForMealErrorAction,
  GetNotesForMealRequestAction,
  SetEditableForNoteAction,
  GetNotesForPageActionCreator,
  GetNotesForPageActions,
  GetNotesForMealActionCreator,
  GetNotesForMealActions,
} from '../../action-types';
import { getNotesAsync } from '../../services';
import { NoteItem, MealType, NotesForMealSearchRequest, NotesSearchRequest, ErrorReason } from '../../models';

const getNotesForPageRequest = (loadingMessage?: string): GetNotesForPageRequestAction => {
  return {
    type: NotesListActionTypes.RequestForPage,
    loadingMessage,
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

const getNotesForMealRequest = (mealType: MealType, loadingMessage?: string): GetNotesForMealRequestAction => {
  return {
    type: NotesListActionTypes.RequestForMeal,
    mealType,
    loadingMessage,
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

enum NotesListBaseErrorMessages {
  NotesForPage = 'Failed to get notes for page',
  NotesForMeal = 'Failed to get notes for meal',
}

export const getNotesForPage: GetNotesForPageActionCreator = (request: NotesSearchRequest) => {
  return async (
    dispatch: Dispatch<GetNotesForPageActions>,
  ): Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction> => {
    dispatch(getNotesForPageRequest('Loading page content'));
    try {
      const response = await getNotesAsync(request);

      if (response.ok) {
        const noteItems = await response.json();
        return dispatch(getNotesForPageSuccess(noteItems));
      }

      let errorMessage = `${NotesListBaseErrorMessages.NotesForPage}`;

      switch (response.status) {
        case 400:
          errorMessage += `: ${ErrorReason.WrongRequestData}`;
          break;
        case 404:
          errorMessage += `: page with id = ${request.pageId} not found`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      return dispatch(getNotesForPageError(errorMessage));
    } catch (error) {
      return dispatch(getNotesForPageError(NotesListBaseErrorMessages.NotesForPage));
    }
  };
};

export const getNotesForMeal: GetNotesForMealActionCreator = ({ pageId, mealType }: NotesForMealSearchRequest) => {
  return async (
    dispatch: Dispatch<GetNotesForMealActions>,
  ): Promise<GetNotesForMealSuccessAction | GetNotesForMealErrorAction> => {
    dispatch(getNotesForMealRequest(mealType, 'Loading notes'));
    try {
      const response = await getNotesAsync({
        pageId,
        mealType,
      });

      if (response.ok) {
        const noteItems = await response.json();
        return dispatch(getNotesForMealSuccess(mealType, noteItems));
      }

      let errorMessage = `${NotesListBaseErrorMessages.NotesForMeal}`;

      switch (response.status) {
        case 400:
          errorMessage += `: ${ErrorReason.WrongRequestData}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      return dispatch(getNotesForMealError(mealType, errorMessage));
    } catch (error) {
      return dispatch(getNotesForMealError(mealType, NotesListBaseErrorMessages.NotesForMeal));
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
