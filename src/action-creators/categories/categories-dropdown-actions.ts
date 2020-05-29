import {
  GetCategoryDropdownItemsRequestAction,
  CategoriesDropdownActionTypes,
  GetCategoryDropdownItemsSuccessAction,
  GetCategoryDropdownItemsErrorAction,
  GetCategoryDropdownItemsActionCreator,
  GetCategoryDropdownItemsActions,
} from '../../action-types';
import { CategoryDropdownItem, CategoryDropdownSearchRequest, ErrorReason } from '../../models';
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

enum CategoriesDropdownErrorMessages {
  GetItems = 'Failed to get categories',
}

export const getCategoryDropdownItems: GetCategoryDropdownItemsActionCreator = (
  request: CategoryDropdownSearchRequest,
) => {
  return async (
    dispatch: Dispatch<GetCategoryDropdownItemsActions>,
  ): Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction> => {
    dispatch(getCategoryDropdownItemsRequest('Loading categories'));
    try {
      const response = await getCategoryDropdownItemsAsync(request);

      if (response.ok) {
        const categoryDropdownItems = await response.json();
        return dispatch(getCategoryDropdownItemsSuccess(categoryDropdownItems));
      }

      let errorMessage = `${CategoriesDropdownErrorMessages.GetItems}`;

      switch (response.status) {
        case 400:
          errorMessage += `: ${ErrorReason.WrongRequestData}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      return dispatch(getCategoryDropdownItemsError(errorMessage));
    } catch (error) {
      return dispatch(getCategoryDropdownItemsError(CategoriesDropdownErrorMessages.GetItems));
    }
  };
};
