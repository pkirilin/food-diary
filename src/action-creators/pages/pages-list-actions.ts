import { PagesFilter, PageItem } from '../../models';
import {
  PagesListActionTypes,
  SetSelectedForPageAction,
  SetSelectedForAllPagesAction,
  SetEditableForPagesAction,
} from '../../action-types';
import { createAsyncAction, createErrorResponseHandler, createSuccessJsonResponseHandler } from '../../helpers';
import { API_URL } from '../../config';

export const getPages = createAsyncAction<
  PageItem[],
  PagesFilter,
  PagesListActionTypes.Request,
  PagesListActionTypes.Success,
  PagesListActionTypes.Error
>(
  PagesListActionTypes.Request,
  PagesListActionTypes.Success,
  PagesListActionTypes.Error,
  {
    baseUrl: `${API_URL}/v1/pages`,
    method: 'GET',
    modifyUrl: (baseUrl, { startDate, endDate, sortOrder }) => {
      let requestUrl = `${baseUrl}?sortOrder=${sortOrder}`;

      if (startDate) {
        requestUrl += `&startDate=${startDate}`;
      }
      if (endDate) {
        requestUrl += `&endDate=${endDate}`;
      }

      return requestUrl;
    },
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get pages list'),
  },
  'Loading pages',
);

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
