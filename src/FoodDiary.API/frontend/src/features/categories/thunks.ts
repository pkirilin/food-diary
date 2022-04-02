import config from '../__shared__/config';
import { createApiCallAsyncThunk, handleEmptyResponse } from '../__shared__/utils';
import { CategoryAutocompleteOption, CategoryCreateEdit, CategoryItem } from './models';

export type CategoryEditRequest = {
  id: number;
  category: CategoryCreateEdit;
};

export const getCategories = createApiCallAsyncThunk<CategoryItem[], void>(
  'categories/getCategories',
  () => `${config.apiUrl}/v1/categories`,
  response => response.json(),
  'Failed to get categories',
);

export const createCategory = createApiCallAsyncThunk<number, CategoryCreateEdit>(
  'categories/createCategory',
  () => `${config.apiUrl}/v1/categories`,
  async response => {
    const responseText = await response.text();
    return Number(responseText);
  },
  'Failed to create category',
  {
    method: 'POST',
    bodyCreator: category => JSON.stringify(category),
  },
);

export const editCategory = createApiCallAsyncThunk<void, CategoryEditRequest>(
  'categories/editCategory',
  ({ id }) => `${config.apiUrl}/v1/categories/${id}`,
  handleEmptyResponse,
  'Failed to update category',
  {
    method: 'PUT',
    bodyCreator: ({ category }) => JSON.stringify(category),
  },
);

export const deleteCategory = createApiCallAsyncThunk<void, number>(
  'categories/deleteCategory',
  id => `${config.apiUrl}/v1/categories/${id}`,
  handleEmptyResponse,
  'Failed to delete category',
  {
    method: 'DELETE',
  },
);

export const getCategoriesAutocomplete = createApiCallAsyncThunk<
  CategoryAutocompleteOption[],
  void
>(
  'categories/getCategoriesAutocomplete',
  () => `${config.apiUrl}/api/v1/categories/autocomplete`,
  response => response.json(),
  'Failed to get categories',
);
