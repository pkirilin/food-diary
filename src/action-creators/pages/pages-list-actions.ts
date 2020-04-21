import { Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { PagesFilter, PageItem } from '../../models';
import {
  GetPagesListSuccessAction,
  GetPagesListRequestAction,
  PagesListActionTypes,
  GetPagesListErrorAction,
  CreateDraftPageAction,
  DeleteDraftPageAction,
  SetSelectedForPageAction,
  SetSelectedForAllPagesAction,
  SetEditableForPagesAction,
} from '../../action-types';
import { getPagesAsync } from '../../services';

const getPagesRequest = (): GetPagesListRequestAction => {
  return {
    type: PagesListActionTypes.Request,
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

export const getPages: ActionCreator<ThunkAction<
  Promise<GetPagesListSuccessAction | GetPagesListErrorAction>,
  PageItem[],
  PagesFilter,
  GetPagesListSuccessAction | GetPagesListErrorAction
>> = (filter: PagesFilter) => {
  return async (dispatch: Dispatch): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
    const baseErrorMessage = 'Failed to get pages list';
    dispatch(getPagesRequest());
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

export const createDraftPage = (draftPage: PageItem): CreateDraftPageAction => {
  return {
    type: PagesListActionTypes.CreateDraftPage,
    draftPage,
  };
};

export const deleteDraftPage = (draftPageId: number): DeleteDraftPageAction => {
  return {
    type: PagesListActionTypes.DeleteDraftPage,
    draftPageId,
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
