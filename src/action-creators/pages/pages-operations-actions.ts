import { PageCreateEdit, PageEditRequest, PagesExportRequest } from '../../models';
import { PagesOperationsActionTypes } from '../../action-types';
import {
  createAsyncAction,
  createErrorResponseHandler,
  createSuccessBlobResponseHandler,
  createSuccessNumberResponseHandler,
  createSuccessTextResponseHandler,
} from '../../helpers';
import { API_URL } from '../../config';

export const createPage = createAsyncAction<
  number,
  PageCreateEdit,
  PagesOperationsActionTypes.CreateRequest,
  PagesOperationsActionTypes.CreateSuccess,
  PagesOperationsActionTypes.CreateError
>(
  PagesOperationsActionTypes.CreateRequest,
  PagesOperationsActionTypes.CreateSuccess,
  PagesOperationsActionTypes.CreateError,
  {
    baseUrl: `${API_URL}/v1/pages`,
    method: 'POST',
    constructBody: (page): string => JSON.stringify(page),
    onSuccess: createSuccessNumberResponseHandler(),
    onError: createErrorResponseHandler('Failed to create page'),
  },
  'Creating page',
);

export const editPage = createAsyncAction<
  {},
  PageEditRequest,
  PagesOperationsActionTypes.EditRequest,
  PagesOperationsActionTypes.EditSuccess,
  PagesOperationsActionTypes.EditError
>(
  PagesOperationsActionTypes.EditRequest,
  PagesOperationsActionTypes.EditSuccess,
  PagesOperationsActionTypes.EditError,
  {
    baseUrl: `${API_URL}/v1/pages`,
    method: 'PUT',
    modifyUrl: (baseUrl, { id }): string => `${baseUrl}/${id}`,
    constructBody: ({ page }): string => JSON.stringify(page),
    onError: createErrorResponseHandler('Failed to update page'),
  },
  'Updating page',
);

export const deletePages = createAsyncAction<
  {},
  number[],
  PagesOperationsActionTypes.DeleteRequest,
  PagesOperationsActionTypes.DeleteSuccess,
  PagesOperationsActionTypes.DeleteError
>(
  PagesOperationsActionTypes.DeleteRequest,
  PagesOperationsActionTypes.DeleteSuccess,
  PagesOperationsActionTypes.DeleteError,
  {
    baseUrl: `${API_URL}/v1/pages/batch`,
    method: 'DELETE',
    constructBody: pageIds => JSON.stringify(pageIds),
    onError: createErrorResponseHandler('Failed to delete selected'),
  },
  'Deleting pages',
);

export const exportPages = createAsyncAction<
  Blob,
  PagesExportRequest,
  PagesOperationsActionTypes.ExportRequest,
  PagesOperationsActionTypes.ExportSuccess,
  PagesOperationsActionTypes.ExportError
>(
  PagesOperationsActionTypes.ExportRequest,
  PagesOperationsActionTypes.ExportSuccess,
  PagesOperationsActionTypes.ExportError,
  {
    baseUrl: `${API_URL}/v1/exports`,
    method: 'GET',
    modifyUrl: (baseUrl, { startDate, endDate, format }) =>
      `${baseUrl}/${format}?startDate=${startDate}&endDate=${endDate}`,
    onSuccess: createSuccessBlobResponseHandler(),
    onError: createErrorResponseHandler('Failed to export pages'),
  },
  'Exporting pages',
);

export const importPages = createAsyncAction<
  {},
  File,
  PagesOperationsActionTypes.ImportRequest,
  PagesOperationsActionTypes.ImportSuccess,
  PagesOperationsActionTypes.ImportError
>(
  PagesOperationsActionTypes.ImportRequest,
  PagesOperationsActionTypes.ImportSuccess,
  PagesOperationsActionTypes.ImportError,
  {
    baseUrl: `${API_URL}/v1/imports/json`,
    method: 'POST',
    contentType: 'none',
    constructBody: importFile => {
      const formData = new FormData();
      formData.append('importFile', importFile, importFile.name);
      return formData;
    },
    onError: createErrorResponseHandler('Failed to import pages'),
  },
  'Importing pages',
);

export const getDateForNewPage = createAsyncAction<
  string,
  {},
  PagesOperationsActionTypes.DateForNewPageRequest,
  PagesOperationsActionTypes.DateForNewPageSuccess,
  PagesOperationsActionTypes.DateForNewPageError
>(
  PagesOperationsActionTypes.DateForNewPageRequest,
  PagesOperationsActionTypes.DateForNewPageSuccess,
  PagesOperationsActionTypes.DateForNewPageError,
  {
    baseUrl: `${API_URL}/v1/pages/date`,
    method: 'GET',
    onSuccess: createSuccessTextResponseHandler(),
    onError: createErrorResponseHandler('Failed to get date for new page'),
  },
  'Getting date',
);
