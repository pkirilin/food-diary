import { Action } from 'redux';
import { PageItemState } from '../../store';

export enum PagesListActionType {
  Request = 'GET_PAGES_LIST__REQUEST',
  Success = 'GET_PAGES_LIST__SUCCESS',
  Error = 'GET_PAGES_LIST__ERROR',
  CreateDraftPage = 'PAGES_LIST__CREATE_DRAFT_PAGE',
}

export interface GetPagesListRequestAction extends Action<PagesListActionType.Request> {
  type: PagesListActionType.Request;
}

export interface GetPagesListSuccessAction extends Action<PagesListActionType.Success> {
  type: PagesListActionType.Success;
  pages: PageItemState[];
}

export interface GetPagesListErrorAction extends Action<PagesListActionType.Error> {
  type: PagesListActionType.Error;
  errorMessage: string;
}

export interface CreateDraftPageAction extends Action<PagesListActionType.CreateDraftPage> {
  type: PagesListActionType.CreateDraftPage;
  draftPage: PageItemState;
}

export type PagesListActions =
  | GetPagesListRequestAction
  | GetPagesListSuccessAction
  | GetPagesListErrorAction
  | CreateDraftPageAction;
