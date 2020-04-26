import { Action } from 'redux';
import { CategoryCreateEdit, CategoryEditRequest } from '../../models';

export enum CategoriesOperationsActionTypes {
  CreateRequest = 'CATEGORIES_OPERATIONS__CREATE_REQUEST',
  CreateSuccess = 'CATEGORIES_OPERATIONS__CREATE_SUCCESS',
  CreateError = 'CATEGORIES_OPERATIONS__CREATE_ERROR',

  EditRequest = 'CATEGORIES_OPERATIONS__EDIT_REQUEST',
  EditSuccess = 'CATEGORIES_OPERATIONS__EDIT_SUCCESS',
  EditError = 'CATEGORIES_OPERATIONS__EDIT_ERROR',

  DeleteRequest = 'CATEGORIES_OPERATIONS__DELETE_REQUEST',
  DeleteSuccess = 'CATEGORIES_OPERATIONS__DELETE_SUCCESS',
  DeleteError = 'CATEGORIES_OPERATIONS__DELETE_ERROR',
}

export interface CreateCategoryRequestAction extends Action<CategoriesOperationsActionTypes.CreateRequest> {
  type: CategoriesOperationsActionTypes.CreateRequest;
  category: CategoryCreateEdit;
  operationMessage: string;
}

export interface CreateCategorySuccessAction extends Action<CategoriesOperationsActionTypes.CreateSuccess> {
  type: CategoriesOperationsActionTypes.CreateSuccess;
}

export interface CreateCategoryErrorAction extends Action<CategoriesOperationsActionTypes.CreateError> {
  type: CategoriesOperationsActionTypes.CreateError;
  error: string;
}

export interface EditCategoryRequestAction extends Action<CategoriesOperationsActionTypes.EditRequest> {
  type: CategoriesOperationsActionTypes.EditRequest;
  request: CategoryEditRequest;
  operationMessage: string;
}

export interface EditCategorySuccessAction extends Action<CategoriesOperationsActionTypes.EditSuccess> {
  type: CategoriesOperationsActionTypes.EditSuccess;
}

export interface EditCategoryErrorAction extends Action<CategoriesOperationsActionTypes.EditError> {
  type: CategoriesOperationsActionTypes.EditError;
  error: string;
}

export interface DeleteCategoryRequestAction extends Action<CategoriesOperationsActionTypes.DeleteRequest> {
  type: CategoriesOperationsActionTypes.DeleteRequest;
  operationMessage: string;
}

export interface DeleteCategorySuccessAction extends Action<CategoriesOperationsActionTypes.DeleteSuccess> {
  type: CategoriesOperationsActionTypes.DeleteSuccess;
}

export interface DeleteCategoryErrorAction extends Action<CategoriesOperationsActionTypes.DeleteError> {
  type: CategoriesOperationsActionTypes.DeleteError;
  error: string;
}

type CreateCategoryActions = CreateCategoryRequestAction | CreateCategorySuccessAction | CreateCategoryErrorAction;

type EditCategoryActions = EditCategoryRequestAction | EditCategorySuccessAction | EditCategoryErrorAction;

type DeleteCategoryActions = DeleteCategoryRequestAction | DeleteCategorySuccessAction | DeleteCategoryErrorAction;

export type CategoriesOperationsActions = CreateCategoryActions | EditCategoryActions | DeleteCategoryActions;
