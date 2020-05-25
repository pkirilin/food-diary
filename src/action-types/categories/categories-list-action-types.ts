import { Action, ActionCreator } from 'redux';
import { CategoryItem } from '../../models';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

export enum CategoriesListActionTypes {
  Request = 'CATEGORIES_LIST__REQUEST',
  Success = 'CATEGORIES_LIST__SUCCESS',
  Error = 'CATEGORIES_LIST__ERROR',
  SetEditable = 'CATEGORIES_LIST__SET_EDITABLE_FOR_PAGES',
}

export interface GetCategoriesListRequestAction extends Action<CategoriesListActionTypes.Request> {
  type: CategoriesListActionTypes.Request;
  loadingMessage?: string;
}

export interface GetCategoriesListSuccessAction extends Action<CategoriesListActionTypes.Success> {
  type: CategoriesListActionTypes.Success;
  categories: CategoryItem[];
}

export interface GetCategoriesListErrorAction extends Action<CategoriesListActionTypes.Error> {
  type: CategoriesListActionTypes.Error;
  errorMessage: string;
}

export interface SetEditableForCategoriesAction extends Action<CategoriesListActionTypes.SetEditable> {
  type: CategoriesListActionTypes.SetEditable;
  categoriesIds: number[];
  editable: boolean;
}

export type GetCategoriesListActions =
  | GetCategoriesListRequestAction
  | GetCategoriesListSuccessAction
  | GetCategoriesListErrorAction;

export type CategoriesListActions = GetCategoriesListActions | SetEditableForCategoriesAction;

export type GetCategoriesListActionCreator = ActionCreator<
  ThunkAction<
    Promise<GetCategoriesListSuccessAction | GetCategoriesListErrorAction>,
    CategoryItem[],
    void,
    GetCategoriesListSuccessAction | GetCategoriesListErrorAction
  >
>;

export type GetCategoriesListDispatch = ThunkDispatch<
  CategoryItem[],
  void,
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
>;

export type GetCategoriesListDispatchProp = () => Promise<
  GetCategoriesListSuccessAction | GetCategoriesListErrorAction
>;
