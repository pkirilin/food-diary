import { Action } from 'redux';
import { CategoryItem } from '../../models';

export enum CategoriesListActionTypes {
  Request = 'CATEGORIES_LIST__REQUEST',
  Success = 'CATEGORIES_LIST__SUCCESS',
  Error = 'CATEGORIES_LIST__ERROR',
  CreateDraftCategory = 'CATEGORIES_LIST__CREATE_DRAFT_CATEGORY',
  DeleteDraftCategory = 'CATEGORIES_LIST__DELETE_DRAFT_CATEGORY',
  SetEditable = 'CATEGORIES_LIST__SET_EDITABLE_FOR_PAGES',
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

export interface CreateDraftCategoryAction extends Action<CategoriesListActionTypes.CreateDraftCategory> {
  type: CategoriesListActionTypes.CreateDraftCategory;
  draftCategory: CategoryItem;
}

export interface DeleteDraftCategoryAction extends Action<CategoriesListActionTypes.DeleteDraftCategory> {
  type: CategoriesListActionTypes.DeleteDraftCategory;
  draftCategoryId: number;
}

export interface SetEditableForCategoriesAction extends Action<CategoriesListActionTypes.SetEditable> {
  type: CategoriesListActionTypes.SetEditable;
  categoriesIds: number[];
  editable: boolean;
}

export type CategoriesListActions =
  | GetCategoriesListRequestAction
  | GetCategoriesListSuccessAction
  | GetCategoriesListErrorAction
  | CreateDraftCategoryAction
  | DeleteDraftCategoryAction
  | SetEditableForCategoriesAction;
