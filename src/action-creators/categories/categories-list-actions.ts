import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  GetCategoriesListSuccessAction,
  GetCategoriesListErrorAction,
  GetCategoriesListRequestAction,
  CategoriesListActionTypes,
  CreateDraftCategoryAction,
  DeleteDraftCategoryAction,
  SetEditableForCategoriesAction,
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

export const getCategories: ActionCreator<ThunkAction<
  Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>,
  CategoryItem[],
  void,
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
>> = () => {
  return async (dispatch: Dispatch): Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction> => {
    dispatch(getCategoriesRequest());

    try {
      const response = await getCategoriesAsync();
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
