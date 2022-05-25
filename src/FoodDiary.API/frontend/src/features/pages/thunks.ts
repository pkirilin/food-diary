import config from '../__shared__/config';
import { SortOrder } from '../__shared__/models';
import {
  createApiCallAsyncThunk,
  createUrl,
  downloadFile,
  handleEmptyResponse,
} from '../__shared__/utils';
import { ExportPagesToJsonRequest, Page, PageCreateEdit, PagesSearchResult } from './models';

export type GetPagesRequest = {
  startDate?: string;
  endDate?: string;
  sortOrder: SortOrder;
  pageNumber: number;
  pageSize: number;
};

export type EditPageRequest = {
  id: number;
  page: PageCreateEdit;
};

export interface PageByIdResponse {
  currentPage: Page;
  previousPage: Page;
  nextPage: Page;
}

export const getPages = createApiCallAsyncThunk<PagesSearchResult, GetPagesRequest>(
  'pages/getPages',
  params => createUrl(`${config.apiUrl}/v1/pages`, params),
  response => response.json(),
  'Failed to get pages',
);

export const getPageById = createApiCallAsyncThunk<PageByIdResponse, number>(
  'pages/getPageById',
  id => `${config.apiUrl}/v1/pages/${id}`,
  response => response.json(),
  'Failed to get page',
);

export const createPage = createApiCallAsyncThunk<number, PageCreateEdit>(
  'pages/createPage',
  () => `${config.apiUrl}/v1/pages`,
  async response => Number(await response.text()),
  'Failed to create page',
  {
    method: 'POST',
    bodyCreator: page => JSON.stringify(page),
  },
);

export const editPage = createApiCallAsyncThunk<void, EditPageRequest>(
  'pages/editPage',
  ({ id }) => `${config.apiUrl}/v1/pages/${id}`,
  handleEmptyResponse,
  'Failed to update page',
  {
    method: 'PUT',
    bodyCreator: ({ page }) => JSON.stringify(page),
  },
);

export const deletePages = createApiCallAsyncThunk<void, number[]>(
  'pages/deletePages',
  () => `${config.apiUrl}/v1/pages/batch`,
  handleEmptyResponse,
  'Failed to delete pages',
  {
    method: 'DELETE',
    bodyCreator: pageids => JSON.stringify(pageids),
  },
);

export const exportPagesToJson = createApiCallAsyncThunk<void, ExportPagesToJsonRequest>(
  'pages/exportToJson',
  params => createUrl(`${config.apiUrl}/api/v1/exports/json`, { ...params }),
  async (response, { startDate, endDate }) => {
    const blob = await response.blob();
    downloadFile(blob, `FoodDiary_${startDate}_${endDate}.json`);
  },
  'Failed to export pages',
);

export const importPages = createApiCallAsyncThunk<void, File>(
  'pages/importPages',
  () => `${config.apiUrl}/v1/imports/json`,
  handleEmptyResponse,
  'Failed to import pages',
  {
    method: 'POST',
    contentType: 'none',
    bodyCreator: importFile => {
      const formData = new FormData();
      formData.append('importFile', importFile, importFile.name);
      return formData;
    },
  },
);

export const getDateForNewPage = createApiCallAsyncThunk<string, void>(
  'pages/getDateForNewPage',
  () => `${config.apiUrl}/v1/pages/date`,
  response => response.text(),
  'Failed to get date for new page',
);
