import {
  CreateCategorySuccessAction,
  CreateCategoryErrorAction,
  CreateCategoryRequestAction,
  CategoriesOperationsActionTypes,
  EditCategorySuccessAction,
  EditCategoryErrorAction,
  DeleteCategorySuccessAction,
  DeleteCategoryErrorAction,
  EditCategoryRequestAction,
  DeleteCategoryRequestAction,
} from '../../action-types';
import { API_URL } from '../../config';
import { createErrorResponseHandler, createSuccessNumberResponseHandler, createThunkWithApiCall } from '../../helpers';
import { CategoryCreateEdit, CategoryEditRequest } from '../../models';

export const createCategory = createThunkWithApiCall<
  CreateCategoryRequestAction,
  CreateCategorySuccessAction,
  CreateCategoryErrorAction,
  CategoriesOperationsActionTypes.CreateRequest,
  CategoriesOperationsActionTypes.CreateSuccess,
  CategoriesOperationsActionTypes.CreateError,
  number,
  CategoryCreateEdit
>({
  makeRequest: () => {
    return (category): CreateCategoryRequestAction => {
      if (!category) {
        throw new Error('Failed to create category: payload is undefined');
      }

      return {
        type: CategoriesOperationsActionTypes.CreateRequest,
        requestMessage: 'Creating category',
        payload: category,
      };
    };
  },
  makeSuccess: () => {
    return (createdCategoryId): CreateCategorySuccessAction => {
      if (!createdCategoryId) {
        throw new Error('Failed to create category: createdCategoryId is undefined');
      }

      return {
        type: CategoriesOperationsActionTypes.CreateSuccess,
        data: createdCategoryId,
      };
    };
  },
  makeError: () => {
    return (receivedErrorMessage): CreateCategoryErrorAction => ({
      type: CategoriesOperationsActionTypes.CreateError,
      errorMessage: receivedErrorMessage ?? '',
    });
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/categories`,
    method: 'POST',
    onSuccess: createSuccessNumberResponseHandler(),
    onError: createErrorResponseHandler('Failed to create category'),
    constructBody: (category): string => JSON.stringify(category),
  },
});

export const editCategory = createThunkWithApiCall<
  EditCategoryRequestAction,
  EditCategorySuccessAction,
  EditCategoryErrorAction,
  CategoriesOperationsActionTypes.EditRequest,
  CategoriesOperationsActionTypes.EditSuccess,
  CategoriesOperationsActionTypes.EditError,
  {},
  CategoryEditRequest
>({
  makeRequest: () => {
    return (categoryEditRequest): EditCategoryRequestAction => {
      if (!categoryEditRequest) {
        throw new Error('Failed to update category: categoryEditRequest is undefined');
      }

      return {
        type: CategoriesOperationsActionTypes.EditRequest,
        requestMessage: 'Updating category',
        payload: categoryEditRequest,
      };
    };
  },
  makeSuccess: () => {
    return (): EditCategorySuccessAction => ({
      type: CategoriesOperationsActionTypes.EditSuccess,
      data: {},
    });
  },
  makeError: () => {
    return (receivedErrorMessage): EditCategoryErrorAction => ({
      type: CategoriesOperationsActionTypes.EditError,
      errorMessage: receivedErrorMessage ?? '',
    });
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/categories`,
    method: 'PUT',
    onError: createErrorResponseHandler('Failed to update category'),
    modifyUrl: (baseUrl, { id }): string => `${baseUrl}/${id}`,
    constructBody: ({ category }): string => JSON.stringify(category),
  },
});

export const deleteCategory = createThunkWithApiCall<
  DeleteCategoryRequestAction,
  DeleteCategorySuccessAction,
  DeleteCategoryErrorAction,
  CategoriesOperationsActionTypes.DeleteRequest,
  CategoriesOperationsActionTypes.DeleteSuccess,
  CategoriesOperationsActionTypes.DeleteError,
  {},
  number
>({
  makeRequest: () => {
    return (categoryId): DeleteCategoryRequestAction => ({
      type: CategoriesOperationsActionTypes.DeleteRequest,
      requestMessage: 'Deleting category',
      payload: categoryId ?? 0,
    });
  },
  makeSuccess: () => {
    return (): DeleteCategorySuccessAction => ({
      type: CategoriesOperationsActionTypes.DeleteSuccess,
      data: {},
    });
  },
  makeError: () => {
    return (receivedErrorMessage): DeleteCategoryErrorAction => ({
      type: CategoriesOperationsActionTypes.DeleteError,
      errorMessage: receivedErrorMessage ?? '',
    });
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/categories`,
    method: 'DELETE',
    onError: createErrorResponseHandler('Failed to delete category'),
    modifyUrl: (baseUrl, categoryId): string => `${baseUrl}/${categoryId}`,
  },
});
