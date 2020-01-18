import { Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { PageItem, PagesFilter } from '../../models';
import {
  GetPagesListSuccessAction,
  GetPagesListRequestAction,
  PagesListActionType,
  GetPagesListErrorAction,
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
