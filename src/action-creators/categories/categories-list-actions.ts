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
import { CategoryItem, ErrorReason } from '../../models';
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

enum CategoriesListErrorMessages {
  GetList = 'Failed to get categories',
}

export const getCategories: GetCategoriesListActionCreator = () => {
  return async (
    dispatch: Dispatch<GetCategoriesListActions>,
  ): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
    dispatch(getCategoriesRequest('Loading categories'));
    try {
      const response = await getCategoriesAsync();

      if (response.ok) {
        const categories = await response.json();
        return dispatch(getCategoriesSuccess(categories));
      }

      let errorMessage = `${CategoriesListErrorMessages.GetList}`;

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

      return dispatch(getCategoriesError(errorMessage));
    } catch (error) {
      return dispatch(getCategoriesError(CategoriesListErrorMessages.GetList));
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
