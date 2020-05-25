import { Dispatch } from 'redux';
import {
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  GetCategoriesListRequestAction,
  CategoriesListActionTypes,
  SetEditableForCategoriesAction,
  GetCategoriesListActionCreator,
  GetCategoriesListActions,
} from '../../action-types';
import { CategoryItem } from '../../models';
import { getCategoriesAsync } from '../../services';

const getCategoriesRequest = (loadingMessage?: string): GetCategoriesListRequestAction => {
  return {
    type: CategoriesListActionTypes.Request,
    loadingMessage,
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

export const getCategories: GetCategoriesListActionCreator = () => {
  return async (
    dispatch: Dispatch<GetCategoriesListActions>,
  ): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
    const baseErrorMessage = 'Failed to get categories';
    dispatch(getCategoriesRequest('Loading categories'));
    try {
      const response = await getCategoriesAsync();

      if (response.ok) {
        const categories = await response.json();
        return dispatch(getCategoriesSuccess(categories));
      }

      switch (response.status) {
        case 400:
          return dispatch(getCategoriesError(`${baseErrorMessage}: wrong request data`));
        case 500:
          return dispatch(getCategoriesError(`${baseErrorMessage}: server error`));
        default:
          return dispatch(getCategoriesError(`${baseErrorMessage}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      return dispatch(getCategoriesError(baseErrorMessage));
    }
  };
};

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
