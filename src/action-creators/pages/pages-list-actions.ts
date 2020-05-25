import { Dispatch } from 'redux';
import { PagesFilter, PageItem } from '../../models';
import {
  GetPagesListSuccessAction,
  GetPagesListRequestAction,
  PagesListActionTypes,
  GetPagesListErrorAction,
  SetSelectedForPageAction,
  SetSelectedForAllPagesAction,
  SetEditableForPagesAction,
  GetPagesListActionCreator,
  GetPagesListActions,
} from '../../action-types';
import { getPagesAsync } from '../../services';

const getPagesRequest = (loadingMessage?: string): GetPagesListRequestAction => {
  return {
    type: PagesListActionTypes.Request,
    loadingMessage,
  };
};

const getPagesSuccess = (pages: PageItem[]): GetPagesListSuccessAction => {
  return {
    type: PagesListActionTypes.Success,
    pages,
  };
};

const getPagesError = (errorMessage: string): GetPagesListErrorAction => {
  return {
    type: PagesListActionTypes.Error,
    errorMessage,
  };
};

export const getPages: GetPagesListActionCreator = (filter: PagesFilter) => {
  return async (
    dispatch: Dispatch<GetPagesListActions>,
  ): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
    const baseErrorMessage = 'Failed to get pages list';
    dispatch(getPagesRequest('Loading pages'));
    try {
      const response = await getPagesAsync(filter);

      if (response.ok) {
        const pages = await response.json();
        return dispatch(getPagesSuccess(pages));
      }

      switch (response.status) {
        case 400:
          return dispatch(getPagesError(`${baseErrorMessage}: wrong request data`));
        case 500:
          return dispatch(getPagesError(`${baseErrorMessage}: server error`));
        default:
          return dispatch(getPagesError(`${baseErrorMessage}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      return dispatch(getPagesError(baseErrorMessage));
    }
  };
};

export const setSelectedForPage = (selected: boolean, pageId: number): SetSelectedForPageAction => {
  return {
    type: PagesListActionTypes.SetSelected,
    selected,
    pageId,
  };
};

export const setSelectedForAllPages = (selected: boolean): SetSelectedForAllPagesAction => {
  return {
    type: PagesListActionTypes.SetSelectedAll,
    selected,
  };
};

export const setEditableForPages = (pagesIds: number[], editable: boolean): SetEditableForPagesAction => {
  return {
    type: PagesListActionTypes.SetEditable,
    pagesIds,
    editable,
  };
};
