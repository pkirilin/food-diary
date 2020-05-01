import { Dispatch } from 'redux';
import {
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  GetCategoriesListRequestAction,
  CategoriesListActionTypes,
  CreateDraftCategoryAction,
  DeleteDraftCategoryAction,
  SetEditableForCategoriesAction,
  GetCategoriesListActionCreator,
  GetCategoriesListActions,
} from '../../action-types';
import { CategoryItem } from '../../models';
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

export const getCategories: GetCategoriesListActionCreator = () => {
  return async (
    dispatch: Dispatch<GetCategoriesListActions>,
  ): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
    const baseErrorMessage = 'Failed to get categories';
    dispatch(getCategoriesRequest());
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

export const createDraftCategory = (draftCategory: CategoryItem): CreateDraftCategoryAction => {
  return {
    type: CategoriesListActionTypes.CreateDraftCategory,
    draftCategory,
  };
};

export const deleteDraftCategory = (draftCategoryId: number): DeleteDraftCategoryAction => {
  return {
    type: CategoriesListActionTypes.DeleteDraftCategory,
    draftCategoryId,
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
