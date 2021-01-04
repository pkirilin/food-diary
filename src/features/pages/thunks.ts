import config from '../__shared__/config';
import { SortOrder } from '../__shared__/models';
import { createApiCallAsyncThunk, createUrl } from '../__shared__/utils';
import { PageItem } from './models';

export type GetPagesRequest = {
  startDate?: string;
  endDate?: string;
  sortOrder: SortOrder;
};

export const getPages = createApiCallAsyncThunk<PageItem[], GetPagesRequest>(
  'pages/getPages',
  params => createUrl(`${config.apiUrl}/v1/pages`, params),
  response => response.json(),
  'Failed to get pages',
);
