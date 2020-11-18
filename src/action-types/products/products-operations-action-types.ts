import { ProductEditRequest, ProductCreateEdit } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ThunkHelperAllActions, ThunkHelperResultActions } from '../../helpers';

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

export type CreateProductActions = ThunkHelperAllActions<
  ProductsOperationsActionTypes.CreateRequest,
  ProductsOperationsActionTypes.CreateSuccess,
  ProductsOperationsActionTypes.CreateError,
  {},
  ProductCreateEdit
>;

export type EditProductActions = ThunkHelperAllActions<
  ProductsOperationsActionTypes.EditRequest,
  ProductsOperationsActionTypes.EditSuccess,
  ProductsOperationsActionTypes.EditError,
  {},
  ProductEditRequest
>;

export type DeleteProductActions = ThunkHelperAllActions<
  ProductsOperationsActionTypes.DeleteRequest,
  ProductsOperationsActionTypes.DeleteSuccess,
  ProductsOperationsActionTypes.DeleteError,
  {},
  number
>;

export type CreateProductResultActions = ThunkHelperResultActions<
  ProductsOperationsActionTypes.CreateSuccess,
  ProductsOperationsActionTypes.CreateError,
  {},
  ProductCreateEdit
>;

export type EditProductResultActions = ThunkHelperResultActions<
  ProductsOperationsActionTypes.EditSuccess,
  ProductsOperationsActionTypes.EditError,
  {},
  ProductEditRequest
>;

export type DeleteProductResultActions = ThunkHelperResultActions<
  ProductsOperationsActionTypes.DeleteSuccess,
  ProductsOperationsActionTypes.DeleteError,
  {},
  number
>;

export type ProductsOperationsActions = CreateProductActions | EditProductActions | DeleteProductActions;

export type CreateProductDispatch = ThunkDispatch<{}, ProductCreateEdit, CreateProductActions>;

export type EditProductDispatch = ThunkDispatch<{}, ProductEditRequest, EditProductActions>;

export type DeleteProductDispatch = ThunkDispatch<{}, number, DeleteProductActions>;

export type CreateProductDispatchProp = (product: ProductCreateEdit) => Promise<CreateProductResultActions>;

export type EditProductDispatchProp = (request: ProductEditRequest) => Promise<EditProductResultActions>;

export type DeleteProductDispatchProp = (productId: number) => Promise<DeleteProductResultActions>;
