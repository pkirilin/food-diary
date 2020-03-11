import { Action } from 'redux';
import { CategoryDropdownItem } from '../../models';

export enum CategoriesDropdownActionTypes {
  Request = 'CATEGORIES_DROPDOWN_ITEMS__REQUEST',
  Success = 'CATEGORIES_DROPDOWN_ITEMS__SUCCESS',
  Error = 'CATEGORIES_DROPDOWN_ITEMS__ERROR',
}

export interface GetCategoryDropdownItemsRequestAction extends Action<CategoriesDropdownActionTypes.Request> {
  type: CategoriesDropdownActionTypes.Request;
  operationMessage?: string;
}

export interface GetCategoryDropdownItemsSuccessAction extends Action<CategoriesDropdownActionTypes.Success> {
  type: CategoriesDropdownActionTypes.Success;
  categoryDropdownItems: CategoryDropdownItem[];
}

export interface GetCategoryDropdownItemsErrorAction extends Action<CategoriesDropdownActionTypes.Error> {
  type: CategoriesDropdownActionTypes.Error;
  error?: string;
}

export type CategoriesDropdownActions =
  | GetCategoryDropdownItemsRequestAction
  | GetCategoryDropdownItemsSuccessAction
  | GetCategoryDropdownItemsErrorAction;
