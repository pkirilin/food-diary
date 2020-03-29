import { Action } from 'redux';
import { CategoryCreateEdit } from '../../models';

export enum CategoriesOperationsActionTypes {
  CreateRequest = 'CATEGORIES_OPERATIONS__CREATE_REQUEST',
  CreateSuccess = 'CATEGORIES_OPERATIONS__CREATE_Success',
  CreateError = 'CATEGORIES_OPERATIONS__CREATE_Error',

  EditRequest = 'CATEGORIES_OPERATIONS__EDIT_REQUEST',
  EditSuccess = 'CATEGORIES_OPERATIONS__EDIT_Success',
  EditError = 'CATEGORIES_OPERATIONS__EDIT_Error',

  DeleteRequest = 'CATEGORIES_OPERATIONS__DELETE_REQUEST',
  DeleteSuccess = 'CATEGORIES_OPERATIONS__DELETE_Success',
  DeleteError = 'CATEGORIES_OPERATIONS__DELETE_Error',
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
  category: CategoryCreateEdit;
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
