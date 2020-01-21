import { Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { PagesFilter, PageItem } from '../../models';
import {
  GetPagesListSuccessAction,
  GetPagesListRequestAction,
  PagesListActionType,
  GetPagesListErrorAction,
  CreateDraftPageAction,
  DeleteDraftPageAction,
} from '../../action-types';
import { loadPages } from '../../services';

const createRequestAction = (): GetPagesListRequestAction => {
  return {
    type: PagesListActionType.Request,
  };
};

const createSuccessAction = (pages: PageItem[]): GetPagesListSuccessAction => {
  return {
    type: PagesListActionType.Success,
    pages,
  };
};

const createErrorAction = (errorMessage: string): GetPagesListErrorAction => {
  return {
    type: PagesListActionType.Error,
    errorMessage,
  };
};

export const getPagesActionCreator: ActionCreator<ThunkAction<
  Promise<GetPagesListSuccessAction | GetPagesListErrorAction>,
  PageItem[],
  PagesFilter,
  GetPagesListSuccessAction | GetPagesListErrorAction
>> = (filter: PagesFilter) => {
  return async (dispatch: Dispatch): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
    dispatch(createRequestAction());

    try {
      const response = await loadPages(filter);
      if (!response.ok) {
        return dispatch(createErrorAction('Response is not ok'));
      }

      const pages = await response.json();
      return dispatch(createSuccessAction(pages));
    } catch (error) {
      return dispatch(createErrorAction('Could not fetch pages list'));
    }
  };
};

export const createDraftPageActionCreator = (draftPage: PageItem): CreateDraftPageAction => {
  return {
    type: PagesListActionType.CreateDraftPage,
    draftPage,
  };
};

export const deleteDraftPageActionCreator = (draftPageId: number): DeleteDraftPageAction => {
  return {
    type: PagesListActionType.DeleteDraftPage,
    draftPageId,
  };
};
