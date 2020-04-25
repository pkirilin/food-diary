import {
  GetCategoryDropdownItemsRequestAction,
  CategoriesDropdownActionTypes,
  GetCategoryDropdownItemsSuccessAction,
  GetCategoryDropdownItemsErrorAction,
} from '../../action-types';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../models';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { getCategoryDropdownItemsAsync } from '../../services';

const getCategoryDropdownItemsRequest = (): GetCategoryDropdownItemsRequestAction => {
  return {
    type: CategoriesDropdownActionTypes.Request,
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

export const getCategoryDropdownItems: ActionCreator<ThunkAction<
  Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction>,
  CategoryDropdownItem[],
  CategoryDropdownSearchRequest,
  GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
>> = (request: CategoryDropdownSearchRequest) => {
  return async (
    dispatch: Dispatch,
  ): Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction> => {
    const baseErrorMessage = 'Failed to get categories';
    dispatch(getCategoryDropdownItemsRequest());
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
