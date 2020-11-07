import { ThunkDispatch } from 'redux-thunk';
import { ErrorAction, RequestAction, SuccessAction } from '../../helpers';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../models';

export enum CategoriesDropdownActionTypes {
  Request = 'CATEGORIES_DROPDOWN_ITEMS__REQUEST',
  Success = 'CATEGORIES_DROPDOWN_ITEMS__SUCCESS',
  Error = 'CATEGORIES_DROPDOWN_ITEMS__ERROR',
}

export type GetCategoryDropdownItemsRequestAction = RequestAction<
  CategoriesDropdownActionTypes.Request,
  CategoryDropdownSearchRequest
>;

export type GetCategoryDropdownItemsSuccessAction = SuccessAction<
  CategoriesDropdownActionTypes.Success,
  CategoryDropdownItem[]
>;

export type GetCategoryDropdownItemsErrorAction = ErrorAction<CategoriesDropdownActionTypes.Error>;

export type GetCategoryDropdownItemsActions =
  | GetCategoryDropdownItemsRequestAction
  | GetCategoryDropdownItemsSuccessAction
  | GetCategoryDropdownItemsErrorAction;

export type GetCategoryDropdownItemsDispatch = ThunkDispatch<
  CategoryDropdownItem[],
  CategoryDropdownSearchRequest,
  GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction
>;

export type GetCategoryDropdownItemsDispatchProp = (
  request: CategoryDropdownSearchRequest,
) => Promise<GetCategoryDropdownItemsSuccessAction | GetCategoryDropdownItemsErrorAction>;

export type CategoriesDropdownActions = GetCategoryDropdownItemsActions;
