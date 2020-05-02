import { Action, ActionCreator } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../models';

export enum CategoriesDropdownActionTypes {
  Request = 'CATEGORIES_DROPDOWN_ITEMS__REQUEST',
  Success = 'CATEGORIES_DROPDOWN_ITEMS__SUCCESS',
  Error = 'CATEGORIES_DROPDOWN_ITEMS__ERROR',
}

export interface GetCategoryDropdownItemsRequestAction extends Action<CategoriesDropdownActionTypes.Request> {
  type: CategoriesDropdownActionTypes.Request;
  loadingMessage?: string;
}

export interface GetCategoryDropdownItemsSuccessAction extends Action<CategoriesDropdownActionTypes.Success> {
  type: CategoriesDropdownActionTypes.Success;
  categoryDropdownItems: CategoryDropdownItem[];
}

export interface GetCategoryDropdownItemsErrorAction extends Action<CategoriesDropdownActionTypes.Error> {
  type: CategoriesDropdownActionTypes.Error;
  error?: string;
}

export type GetCategoryDropdownItemsActions =
  | GetCategoryDropdownItemsRequestAction
  | GetCategoryDropdownItemsSuccessAction
  | GetCategoryDropdownItemsErrorAction;

export type CategoriesDropdownActions = GetCategoryDropdownItemsActions;

export type GetCategoryDropdownItemsActionCreator = ActionCreator<
  ThunkAction<
    Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction>,
    CategoryDropdownItem[],
    CategoryDropdownSearchRequest,
    GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
  >
>;

export type GetCategoryDropdownItemsDispatch = ThunkDispatch<
  CategoryDropdownItem[],
  CategoryDropdownSearchRequest,
  GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
>;

export type GetCategoryDropdownItemsDispatchProp = (
  request: CategoryDropdownSearchRequest,
) => Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction>;
