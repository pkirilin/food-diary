import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  GetCategoriesListRequestAction,
  CategoriesListActionTypes,
} from '../../action-types';
import { CategoryItem, CategoriesFilter } from '../../models';
import { getCategoriesAsync } from '../../services';

const getCategoriesRequest = (): GetCategoriesListRequestAction => {
  return {
    type: CategoriesListActionTypes.Request,
  };
};

const getCategoriesSuccess = (categories: CategoryItem[]): GetCategoriesListSuccessAction => {
  return {
    type: CategoriesListActionTypes.Success,
    categories,
  };
};

const getCategoriesError = (errorMessage: string): GetCategoriesListErrorAction => {
  return {
    type: CategoriesListActionTypes.Error,
    errorMessage,
  };
};

export const getCategories: ActionCreator<ThunkAction<
  Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>,
  CategoryItem[],
  CategoriesFilter,
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
>> = (filter: CategoriesFilter) => {
  return async (dispatch: Dispatch): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
    dispatch(getCategoriesRequest());

    try {
      const response = await getCategoriesAsync(filter);
      if (!response.ok) {
        return dispatch(getCategoriesError('Response is not ok'));
      }

      const categories = await response.json();
      return dispatch(getCategoriesSuccess(categories));
    } catch (error) {
      return dispatch(getCategoriesError('Could not fetch categories list'));
    }
  };
};
