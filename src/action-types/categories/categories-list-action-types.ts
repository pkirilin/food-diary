import { Action } from 'redux';
import { CategoryItem } from '../../models';

export enum CategoriesListActionTypes {
  Request = 'CATEGORIES_LIST__REQUEST',
  Success = 'CATEGORIES_LIST__SUCCESS',
  Error = 'CATEGORIES_LIST__ERROR',
}

export interface GetCategoriesListRequestAction extends Action<CategoriesListActionTypes.Request> {
  type: CategoriesListActionTypes.Request;
}

export interface GetCategoriesListSuccessAction extends Action<CategoriesListActionTypes.Success> {
  type: CategoriesListActionTypes.Success;
  categories: CategoryItem[];
}

export interface GetCategoriesListErrorAction extends Action<CategoriesListActionTypes.Error> {
  type: CategoriesListActionTypes.Error;
  errorMessage: string;
}

export type CategoriesListActions =
  | GetCategoriesListRequestAction
  | GetCategoriesListSuccessAction
  | GetCategoriesListErrorAction;
