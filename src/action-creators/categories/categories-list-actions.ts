import {
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  GetCategoriesListRequestAction,
  CategoriesListActionTypes,
  SetEditableForCategoriesAction,
} from '../../action-types';
import { API_URL } from '../../config';
import { createErrorResponseHandler, createSuccessJsonResponseHandler, createThunkWithApiCall } from '../../helpers';
import { CategoryItem } from '../../models';

export const getCategories = createThunkWithApiCall<
  GetCategoriesListRequestAction,
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  CategoriesListActionTypes.Request,
  CategoriesListActionTypes.Success,
  CategoriesListActionTypes.Error,
  CategoryItem[]
>({
  makeRequest: () => {
    return (): GetCategoriesListRequestAction => ({
      type: CategoriesListActionTypes.Request,
      requestMessage: 'Loading categories',
      payload: {},
    });
  },
  makeSuccess: () => {
    return (_, categoryItems): GetCategoriesListSuccessAction => ({
      type: CategoriesListActionTypes.Success,
      data: categoryItems ?? [],
    });
  },
  makeError: () => {
    return (_, receivedErrorMessage): GetCategoriesListErrorAction => ({
      type: CategoriesListActionTypes.Error,
      errorMessage: receivedErrorMessage ?? '',
    });
  },
  apiOptions: {
    baseUrl: `${API_URL}/v1/categories`,
    method: 'GET',
    onSuccess: createSuccessJsonResponseHandler(),
    onError: createErrorResponseHandler('Failed to get categories'),
  },
});

export const setEditableForCategories = (
  categoriesIds: number[],
  editable: boolean,
): SetEditableForCategoriesAction => {
  return {
    type: CategoriesListActionTypes.SetEditable,
    categoriesIds,
    editable,
  };
};
