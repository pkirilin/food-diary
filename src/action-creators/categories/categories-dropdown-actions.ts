import {
  GetCategoryDropdownItemsRequestAction,
  CategoriesDropdownActionTypes,
  GetCategoryDropdownItemsSuccessAction,
  GetCategoryDropdownItemsErrorAction,
} from '../../action-types';
import { CategoryDropdownItem } from '../../models';
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
  void,
  GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
>> = () => {
  return async (
    dispatch: Dispatch,
  ): Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction> => {
    dispatch(getCategoryDropdownItemsRequest());
    try {
      const response = await getCategoryDropdownItemsAsync();
      if (!response.ok) {
        return dispatch(getCategoryDropdownItemsError());
      }
      const categoryDropdownItems = await response.json();
      return dispatch(getCategoryDropdownItemsSuccess(categoryDropdownItems));
    } catch (error) {
      return dispatch(getCategoryDropdownItemsError());
    }
  };
};
