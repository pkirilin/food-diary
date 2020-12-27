import { CategoriesDropdownActionTypes } from '../../action-types';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../models';
import { createErrorResponseHandler, createSuccessJsonResponseHandler, createAsyncAction } from '../../helpers';
import { API_URL } from '../../config';

export const getCategoryDropdownItems = createAsyncAction<
  CategoryDropdownItem[],
  CategoryDropdownSearchRequest,
  CategoriesDropdownActionTypes.Request,
  CategoriesDropdownActionTypes.Success,
  CategoriesDropdownActionTypes.Error
>(
  CategoriesDropdownActionTypes.Request,
  CategoriesDropdownActionTypes.Success,
  CategoriesDropdownActionTypes.Error,
  {
    baseUrl: `${API_URL}/v1/categories/dropdown`,
    method: 'GET',
    modifyUrl: (baseUrl, { categoryNameFilter }): string => {
      if (categoryNameFilter) {
        return `${baseUrl}?categoryNameFilter=${categoryNameFilter}`;
      }

      return baseUrl;
    },
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get categories'),
  },
  'Loading categories',
);
