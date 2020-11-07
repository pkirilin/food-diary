import { CategoryCreateEdit, CategoryEditRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ErrorAction, RequestAction, SuccessAction } from '../../helpers';

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

export type CreateCategoryRequestAction = RequestAction<
  CategoriesOperationsActionTypes.CreateRequest,
  CategoryCreateEdit
>;
export type CreateCategorySuccessAction = SuccessAction<CategoriesOperationsActionTypes.CreateSuccess, number>;
export type CreateCategoryErrorAction = ErrorAction<CategoriesOperationsActionTypes.CreateError>;

export type EditCategoryRequestAction = RequestAction<CategoriesOperationsActionTypes.EditRequest, CategoryEditRequest>;
export type EditCategorySuccessAction = SuccessAction<CategoriesOperationsActionTypes.EditSuccess>;
export type EditCategoryErrorAction = ErrorAction<CategoriesOperationsActionTypes.EditError>;

export type DeleteCategoryRequestAction = RequestAction<CategoriesOperationsActionTypes.DeleteRequest, number>;
export type DeleteCategorySuccessAction = SuccessAction<CategoriesOperationsActionTypes.DeleteSuccess>;
export type DeleteCategoryErrorAction = ErrorAction<CategoriesOperationsActionTypes.DeleteError>;

export type CreateCategoryActions =
  | CreateCategoryRequestAction
  | CreateCategorySuccessAction
  | CreateCategoryErrorAction;

export type EditCategoryActions = EditCategoryRequestAction | EditCategorySuccessAction | EditCategoryErrorAction;

export type DeleteCategoryActions =
  | DeleteCategoryRequestAction
  | DeleteCategorySuccessAction
  | DeleteCategoryErrorAction;

export type CategoriesOperationsActions = CreateCategoryActions | EditCategoryActions | DeleteCategoryActions;

export type CreateCategoryDispatch = ThunkDispatch<
  number,
  CategoryCreateEdit,
  CreateCategorySuccessAction | CreateCategoryErrorAction
>;

export type EditCategoryDispatch = ThunkDispatch<
  {},
  CategoryEditRequest,
  EditCategorySuccessAction | EditCategoryErrorAction
>;

export type DeleteCategoryDispatch = ThunkDispatch<{}, number, DeleteCategorySuccessAction | DeleteCategoryErrorAction>;

export type CreateCategoryDispatchProp = (
  category: CategoryCreateEdit,
) => Promise<CreateCategorySuccessAction | CreateCategoryErrorAction>;

export type EditCategoryDispatchProp = (
  request: CategoryEditRequest,
) => Promise<EditCategorySuccessAction | EditCategoryErrorAction>;

export type DeleteCategoryDispatchProp = (
  categoryId: number,
) => Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction>;
