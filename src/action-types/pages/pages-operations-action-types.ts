import { Action } from 'redux';
import { PageCreateEdit } from '../../models';

export enum PagesOperationsActionTypes {
  CreateRequest = 'PAGES_OPERATIONS__CREATE_REQUEST',
  CreateSuccess = 'PAGES_OPERATIONS__CREATE_SUCCESS',
  CreateError = 'PAGES_OPERATIONS__CREATE_ERROR',

  EditRequest = 'PAGES_OPERATIONS__EDIT_REQUEST',
  EditSuccess = 'PAGES_OPERATIONS__EDIT_SUCCESS',
  EditError = 'PAGES_OPERATIONS__EDIT_ERROR',

  DeleteRequest = 'PAGES_OPERATIONS__DELETE_REQUEST',
  DeleteSuccess = 'PAGES_OPERATIONS__DELETE_SUCCESS',
  DeleteError = 'PAGES_OPERATIONS__DELETE_ERROR',
}

export interface CreatePageRequestAction extends Action<PagesOperationsActionTypes.CreateRequest> {
  type: PagesOperationsActionTypes.CreateRequest;
  page: PageCreateEdit;
}

export interface CreatePageSuccessAction extends Action<PagesOperationsActionTypes.CreateSuccess> {
  type: PagesOperationsActionTypes.CreateSuccess;
}

export interface CreatePageErrorAction extends Action<PagesOperationsActionTypes.CreateError> {
  type: PagesOperationsActionTypes.CreateError;
}

export interface EditPageRequestAction extends Action<PagesOperationsActionTypes.EditRequest> {
  type: PagesOperationsActionTypes.EditRequest;
  page: PageCreateEdit;
}

export interface EditPageSuccessAction extends Action<PagesOperationsActionTypes.EditSuccess> {
  type: PagesOperationsActionTypes.EditSuccess;
}

export interface EditPageErrorAction extends Action<PagesOperationsActionTypes.EditError> {
  type: PagesOperationsActionTypes.EditError;
}

export interface DeletePagesRequestAction extends Action<PagesOperationsActionTypes.DeleteRequest> {
  type: PagesOperationsActionTypes.DeleteRequest;
}

export interface DeletePagesSuccessAction extends Action<PagesOperationsActionTypes.DeleteSuccess> {
  type: PagesOperationsActionTypes.DeleteSuccess;
}

export interface DeletePagesErrorAction extends Action<PagesOperationsActionTypes.DeleteError> {
  type: PagesOperationsActionTypes.DeleteError;
}

type CreatePageActions = CreatePageRequestAction | CreatePageSuccessAction | CreatePageErrorAction;

type EditPageActions = EditPageRequestAction | EditPageSuccessAction | EditPageErrorAction;

type DeletePagesActions = DeletePagesRequestAction | DeletePagesSuccessAction | DeletePagesErrorAction;

export type PagesOperationsActions = CreatePageActions | EditPageActions | DeletePagesActions;
