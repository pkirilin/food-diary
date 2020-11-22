import { CategoriesOperationsActionTypes } from '../../action-types';
import { API_URL } from '../../config';
import { createErrorResponseHandler, createSuccessNumberResponseHandler, createAsyncAction } from '../../helpers';
import { CategoryCreateEdit, CategoryEditRequest } from '../../models';
import { readBadRequestResponseAsync } from '../../utils';

export const createCategory = createAsyncAction<number, CategoryCreateEdit>(
  CategoriesOperationsActionTypes.CreateRequest,
  CategoriesOperationsActionTypes.CreateSuccess,
  CategoriesOperationsActionTypes.CreateError,
  {
    baseUrl: `${API_URL}/v1/categories`,
    method: 'POST',
    onSuccess: createSuccessNumberResponseHandler(),
    onError: createErrorResponseHandler('Failed to create category', {
      400: response => readBadRequestResponseAsync(response),
    }),
    constructBody: (category): string => JSON.stringify(category),
  },
  'Creating category',
);

export const editCategory = createAsyncAction<{}, CategoryEditRequest>(
  CategoriesOperationsActionTypes.EditRequest,
  CategoriesOperationsActionTypes.EditSuccess,
  CategoriesOperationsActionTypes.EditError,
  {
    baseUrl: `${API_URL}/v1/categories`,
    method: 'PUT',
    onError: createErrorResponseHandler('Failed to update category', {
      400: response => readBadRequestResponseAsync(response),
    }),
    modifyUrl: (baseUrl, { id }): string => `${baseUrl}/${id}`,
    constructBody: ({ category }): string => JSON.stringify(category),
  },
  'Updating category',
);

export const deleteCategory = createAsyncAction<{}, number>(
  CategoriesOperationsActionTypes.DeleteRequest,
  CategoriesOperationsActionTypes.DeleteSuccess,
  CategoriesOperationsActionTypes.DeleteError,
  {
    baseUrl: `${API_URL}/v1/categories`,
    method: 'DELETE',
    onError: createErrorResponseHandler('Failed to delete category', {
      400: response => readBadRequestResponseAsync(response),
    }),
    modifyUrl: (baseUrl, categoryId): string => `${baseUrl}/${categoryId}`,
  },
  'Deleting category',
);
