import {
  GetCategoryDropdownItemsRequestAction,
  CategoriesDropdownActionTypes,
  GetCategoryDropdownItemsSuccessAction,
  GetCategoryDropdownItemsErrorAction,
  GetCategoryDropdownItemsActionCreator,
  GetCategoryDropdownItemsActions,
} from '../../action-types';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../models';
import { Dispatch } from 'redux';
import { getCategoryDropdownItemsAsync } from '../../services';

const getCategoryDropdownItemsRequest = (loadingMessage?: string): GetCategoryDropdownItemsRequestAction => {
  return {
    type: CategoriesDropdownActionTypes.Request,
    loadingMessage,
  };
};

const getCategoryDropdownItemsSuccess = (
  categoryDropdownItems: CategoryDropdownItem[],
): GetCategoryDropdownItemsSuccessAction => {
  return {
    type: CategoriesDropdownActionTypes.Success,
    categoryDropdownItems,
  };
};

const getCategoryDropdownItemsError = (error?: string): GetCategoryDropdownItemsErrorAction => {
  return {
    type: CategoriesDropdownActionTypes.Error,
    error,
  };
};

export const getCategoryDropdownItems: GetCategoryDropdownItemsActionCreator = (
  request: CategoryDropdownSearchRequest,
) => {
  return async (
    dispatch: Dispatch<GetCategoryDropdownItemsActions>,
  ): Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction> => {
    const baseErrorMessage = 'Failed to get categories';
    dispatch(getCategoryDropdownItemsRequest('Loading categories'));
    try {
      const response = await getCategoryDropdownItemsAsync(request);

      if (response.ok) {
        const categoryDropdownItems = await response.json();
        return dispatch(getCategoryDropdownItemsSuccess(categoryDropdownItems));
      }

      switch (response.status) {
        case 400:
          return dispatch(getCategoryDropdownItemsError(`${baseErrorMessage}: wrong request data`));
        case 500:
          return dispatch(getCategoryDropdownItemsError(`${baseErrorMessage}: server error`));
        default:
          return dispatch(getCategoryDropdownItemsError(`${baseErrorMessage}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      return dispatch(getCategoryDropdownItemsError(baseErrorMessage));
    }
  };
};
