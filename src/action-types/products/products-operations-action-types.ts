import { Action } from 'redux';
import { ProductEditRequest, ProductCreateEdit } from '../../models';

export enum ProductsOperationsActionTypes {
  CreateRequest = 'PRODUCTS_OPERATIONS__CREATE_REQUEST',
  CreateSuccess = 'PRODUCTS_OPERATIONS__CREATE_SUCCESS',
  CreateError = 'PRODUCTS_OPERATIONS__CREATE_ERROR',

  EditRequest = 'PRODUCTS_OPERATIONS__EDIT_REQUEST',
  EditSuccess = 'PRODUCTS_OPERATIONS__EDIT_SUCCESS',
  EditError = 'PRODUCTS_OPERATIONS__EDIT_ERROR',

  DeleteRequest = 'PRODUCTS_OPERATIONS__DELETE_REQUEST',
  DeleteSuccess = 'PRODUCTS_OPERATIONS__DELETE_SUCCESS',
  DeleteError = 'PRODUCTS_OPERATIONS__DELETE_ERROR',
}

export interface CreateProductRequestAction extends Action<ProductsOperationsActionTypes.CreateRequest> {
  type: ProductsOperationsActionTypes.CreateRequest;
  product: ProductCreateEdit;
  operationMessage: string;
}

export interface CreateProductSuccessAction extends Action<ProductsOperationsActionTypes.CreateSuccess> {
  type: ProductsOperationsActionTypes.CreateSuccess;
}

export interface CreateProductErrorAction extends Action<ProductsOperationsActionTypes.CreateError> {
  type: ProductsOperationsActionTypes.CreateError;
  error: string;
}

export interface EditProductRequestAction extends Action<ProductsOperationsActionTypes.EditRequest> {
  type: ProductsOperationsActionTypes.EditRequest;
  request: ProductEditRequest;
  operationMessage: string;
}

export interface EditProductSuccessAction extends Action<ProductsOperationsActionTypes.EditSuccess> {
  type: ProductsOperationsActionTypes.EditSuccess;
}

export interface EditProductErrorAction extends Action<ProductsOperationsActionTypes.EditError> {
  type: ProductsOperationsActionTypes.EditError;
  error: string;
}

export interface DeleteProductRequestAction extends Action<ProductsOperationsActionTypes.DeleteRequest> {
  type: ProductsOperationsActionTypes.DeleteRequest;
  productId: number;
  operationMessage: string;
}

export interface DeleteProductSuccessAction extends Action<ProductsOperationsActionTypes.DeleteSuccess> {
  type: ProductsOperationsActionTypes.DeleteSuccess;
}

export interface DeleteProductErrorAction extends Action<ProductsOperationsActionTypes.DeleteError> {
  type: ProductsOperationsActionTypes.DeleteError;
  error: string;
}

type CreateProductActions = CreateProductRequestAction | CreateProductSuccessAction | CreateProductErrorAction;

type EditProductActions = EditProductRequestAction | EditProductSuccessAction | EditProductErrorAction;

type DeleteProductActions = DeleteProductRequestAction | DeleteProductSuccessAction | DeleteProductErrorAction;

export type ProductsOperationsActions = CreateProductActions | EditProductActions | DeleteProductActions;
