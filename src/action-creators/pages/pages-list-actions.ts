import { Dispatch } from 'redux';
import { PagesFilter, PageItem, ErrorReason } from '../../models';
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

enum PagesListErrorMessages {
  GetList = 'Failed to get pages list',
}

export const getPages: GetPagesListActionCreator = (filter: PagesFilter) => {
  return async (
    dispatch: Dispatch<GetPagesListActions>,
  ): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
    dispatch(getPagesRequest('Loading pages'));
    try {
      const response = await getPagesAsync(filter);

      if (response.ok) {
        const pages = await response.json();
        return dispatch(getPagesSuccess(pages));
      }

      let errorMessage = `${PagesListErrorMessages.GetList}`;

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

      return dispatch(getPagesError(errorMessage));
    } catch (error) {
      return dispatch(getPagesError(PagesListErrorMessages.GetList));
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
