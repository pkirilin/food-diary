import config from '../__shared__/config';
import { createApiCallAsyncThunk } from '../__shared__/utils';
import { CategoryItem } from './models';

export const getCategories = createApiCallAsyncThunk<CategoryItem[], void>(
  'categories/getCategories',
  () => `${config.apiUrl}/v1/categories`,
  response => response.json(),
  'Failed to get categories',
);
