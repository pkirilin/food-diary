import { Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  GetNotesListSuccessAction,
  GetNotesListErrorAction,
  GetNotesListRequestAction,
  NotesListActionTypes,
} from '../../action-types/notes';
import { getNotesForPageAsync } from '../../services';
import { NotesForPage } from '../../models';

const getNotesRequest = (): GetNotesListRequestAction => {
  return {
    type: NotesListActionTypes.Request,
  };
};

const getNotesSuccess = (notesForPage: NotesForPage): GetNotesListSuccessAction => {
  return {
    type: NotesListActionTypes.Success,
    notes: notesForPage,
  };
};

const getNotesError = (errorMessage: string): GetNotesListErrorAction => {
  return {
    type: NotesListActionTypes.Error,
    errorMessage,
  };
};

export const getNotes: ActionCreator<ThunkAction<
  Promise<GetNotesListSuccessAction | GetNotesListErrorAction>,
  NotesForPage,
  number,
  GetNotesListSuccessAction | GetNotesListErrorAction
>> = (pageId: number) => {
  return async (dispatch: Dispatch): Promise<GetNotesListSuccessAction | GetNotesListErrorAction> => {
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
