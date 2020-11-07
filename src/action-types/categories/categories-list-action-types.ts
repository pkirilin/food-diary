import { Action } from 'redux';
import { CategoryItem } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { RequestAction, SuccessAction, ErrorAction } from '../../helpers';

export enum CategoriesListActionTypes {
  Request = 'CATEGORIES_LIST__REQUEST',
  Success = 'CATEGORIES_LIST__SUCCESS',
  Error = 'CATEGORIES_LIST__ERROR',
  SetEditable = 'CATEGORIES_LIST__SET_EDITABLE_FOR_PAGES',
}

export type GetCategoriesListRequestAction = RequestAction<CategoriesListActionTypes.Request>;
export type GetCategoriesListSuccessAction = SuccessAction<CategoriesListActionTypes.Success, CategoryItem[]>;
export type GetCategoriesListErrorAction = ErrorAction<CategoriesListActionTypes.Error>;

export type GetCategoriesListActions =
  | GetCategoriesListRequestAction
  | GetCategoriesListSuccessAction
  | GetCategoriesListErrorAction;

export type GetCategoriesListDispatch = ThunkDispatch<
  CategoryItem[],
  {},
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
>;

export type GetCategoriesListDispatchProp = () => Promise<
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
>;

export interface SetEditableForCategoriesAction extends Action<CategoriesListActionTypes.SetEditable> {
  categoriesIds: number[];
  editable: boolean;
}

export type CategoriesListActions = GetCategoriesListActions | SetEditableForCategoriesAction;
