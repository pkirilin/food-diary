import { Action } from 'redux';
import { CategoryItem } from '../../models';
import { ThunkHelperAllActions } from '../../helpers';

export enum CategoriesListActionTypes {
  Request = 'CATEGORIES_LIST__REQUEST',
  Success = 'CATEGORIES_LIST__SUCCESS',
  Error = 'CATEGORIES_LIST__ERROR',
  SetEditable = 'CATEGORIES_LIST__SET_EDITABLE_FOR_PAGES',
}

export type GetCategoriesListActions = ThunkHelperAllActions<
  CategoriesListActionTypes.Request,
  CategoriesListActionTypes.Success,
  CategoriesListActionTypes.Error,
  CategoryItem[]
>;

export interface SetEditableForCategoriesAction extends Action<CategoriesListActionTypes.SetEditable> {
  categoriesIds: number[];
  editable: boolean;
}

export type CategoriesListActions = GetCategoriesListActions | SetEditableForCategoriesAction;
