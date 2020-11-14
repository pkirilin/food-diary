import { ThunkDispatch } from 'redux-thunk';
import { ThunkHelperAllActions, ThunkHelperResultActions } from '../../helpers';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../models';

export enum CategoriesDropdownActionTypes {
  Request = 'CATEGORIES_DROPDOWN_ITEMS__REQUEST',
  Success = 'CATEGORIES_DROPDOWN_ITEMS__SUCCESS',
  Error = 'CATEGORIES_DROPDOWN_ITEMS__ERROR',
}

export type GetCategoryDropdownItemsActions = ThunkHelperAllActions<
  CategoriesDropdownActionTypes.Request,
  CategoriesDropdownActionTypes.Success,
  CategoriesDropdownActionTypes.Error,
  CategoryDropdownItem[],
  CategoryDropdownSearchRequest
>;

export type GetCategoryDropdownItemsResultActions = ThunkHelperResultActions<
  CategoriesDropdownActionTypes.Success,
  CategoriesDropdownActionTypes.Error,
  CategoryDropdownItem[],
  CategoryDropdownSearchRequest
>;

export type GetCategoryDropdownItemsDispatch = ThunkDispatch<
  CategoryDropdownItem[],
  CategoryDropdownSearchRequest,
  GetCategoryDropdownItemsResultActions
>;

export type GetCategoryDropdownItemsDispatchProp = (
  request: CategoryDropdownSearchRequest,
) => Promise<GetCategoryDropdownItemsResultActions>;

export type CategoriesDropdownActions = GetCategoryDropdownItemsActions;
