import { Action } from 'redux';
import { PageItem } from '../../models';

export enum PagesListActionType {
  Request = 'GET_PAGES_LIST__REQUEST',
  Success = 'GET_PAGES_LIST__SUCCESS',
  Error = 'GET_PAGES_LIST__ERROR',
}

export interface GetPagesListRequestAction extends Action<PagesListActionType.Request> {
  type: PagesListActionType.Request;
}

export interface GetPagesListSuccessAction extends Action<PagesListActionType.Success> {
  type: PagesListActionType.Success;
  pages: PageItem[];
}

export interface GetPagesListErrorAction extends Action<PagesListActionType.Error> {
  type: PagesListActionType.Error;
  errorMessage: string;
}

export type PagesListActions = GetPagesListRequestAction | GetPagesListSuccessAction | GetPagesListErrorAction;
