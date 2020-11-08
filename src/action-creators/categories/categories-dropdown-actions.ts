import {
  GetCategoryDropdownItemsRequestAction,
  CategoriesDropdownActionTypes,
  GetCategoryDropdownItemsSuccessAction,
  GetCategoryDropdownItemsErrorAction,
} from '../../action-types';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../models';
import { createErrorResponseHandler, createSuccessJsonResponseHandler, createThunkWithApiCall } from '../../helpers';
import { API_URL } from '../../config';

export const getCategoryDropdownItems = createThunkWithApiCall<
  GetCategoryDropdownItemsRequestAction,
  GetCategoryDropdownItemsSuccessAction,
  GetCategoryDropdownItemsErrorAction,
  CategoriesDropdownActionTypes.Request,
  CategoriesDropdownActionTypes.Success,
  CategoriesDropdownActionTypes.Error,
  CategoryDropdownItem[],
  CategoryDropdownSearchRequest
>({
  makeRequest: () => {
    return (dropdownSearchParams): GetCategoryDropdownItemsRequestAction => ({
      type: CategoriesDropdownActionTypes.Request,
      requestMessage: 'Loading categories',
      payload: dropdownSearchParams ?? {},
    });
  },
  makeSuccess: () => {
    return (_, dropdownItems): GetCategoryDropdownItemsSuccessAction => ({
      type: CategoriesDropdownActionTypes.Success,
      data: dropdownItems ?? [],
    });
  },
  makeError: () => {
    return (_, receivedErrorMessage): GetCategoryDropdownItemsErrorAction => ({
      type: CategoriesDropdownActionTypes.Error,
      errorMessage: receivedErrorMessage ?? '',
    });
  },
  apiOptions: {
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
});
