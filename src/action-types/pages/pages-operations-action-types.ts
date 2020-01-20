import { Action } from 'redux';

export enum PagesOperationsActionTypes {
  CreateRequest = 'PAGES_OPERATIONS__CREATE_REQUEST',
  CreateSuccess = 'PAGES_OPERATIONS__CREATE_SUCCESS',
  CreateError = 'PAGES_OPERATIONS__CREATE_ERROR',
}

export interface CreatePageRequestAction extends Action<PagesOperationsActionTypes.CreateRequest> {
  type: PagesOperationsActionTypes.CreateRequest;
}

export interface CreatePageSuccessAction extends Action<PagesOperationsActionTypes.CreateSuccess> {
  type: PagesOperationsActionTypes.CreateSuccess;
}

export interface CreatePageErrorAction extends Action<PagesOperationsActionTypes.CreateError> {
  type: PagesOperationsActionTypes.CreateError;
}

type CreatePageActions = CreatePageRequestAction | CreatePageSuccessAction | CreatePageErrorAction;

export type PagesOperationsActions = CreatePageActions;
