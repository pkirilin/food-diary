import { Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  GetNotesForPageSuccessAction,
  GetNotesForPageErrorAction,
  GetNotesForPageRequestAction,
  NotesListActionTypes,
} from '../../action-types/notes';
import { getNotesForPageAsync } from '../../services';
import { NotesForPage } from '../../models';

const getNotesRequest = (): GetNotesForPageRequestAction => {
  return {
    type: NotesListActionTypes.RequestForPage,
  };
};

const getNotesSuccess = (notesForPage: NotesForPage): GetNotesForPageSuccessAction => {
  return {
    type: NotesListActionTypes.SuccessForPage,
    notesForPage: notesForPage,
  };
};

const getNotesError = (errorMessage: string): GetNotesForPageErrorAction => {
  return {
    type: NotesListActionTypes.ErrorForPage,
    errorMessage,
  };
};

export const getNotes: ActionCreator<ThunkAction<
  Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction>,
  NotesForPage,
  number,
  GetNotesForPageSuccessAction | GetNotesForPageErrorAction
>> = (pageId: number) => {
  return async (dispatch: Dispatch): Promise<GetNotesForPageSuccessAction | GetNotesForPageErrorAction> => {
    dispatch(getNotesRequest());
    try {
      const response = await getNotesForPageAsync(pageId);
      if (!response.ok) {
        return dispatch(getNotesError('Notes for page response error'));
      }

      const notesForPage = await response.json();
      return dispatch(getNotesSuccess(notesForPage));
    } catch (error) {
      return dispatch(getNotesError('Failed to get notes for page from server'));
    }
  };
};
