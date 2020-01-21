import { Action } from 'redux';
import { PageItem } from '../../models';

export enum PagesListActionTypes {
  Request = 'PAGES_LIST__REQUEST',
  Success = 'PAGES_LIST__SUCCESS',
  Error = 'PAGES_LIST__ERROR',
  CreateDraftPage = 'PAGES_LIST__CREATE_DRAFT_PAGE',
  DeleteDraftPage = 'PAGES_LIST__DELETE_DRAFT_PAGE',
}

export interface GetPagesListRequestAction extends Action<PagesListActionTypes.Request> {
  type: PagesListActionTypes.Request;
}

export interface GetPagesListSuccessAction extends Action<PagesListActionTypes.Success> {
  type: PagesListActionTypes.Success;
  pages: PageItem[];
}

export interface GetPagesListErrorAction extends Action<PagesListActionTypes.Error> {
  type: PagesListActionTypes.Error;
  errorMessage: string;
}

export interface CreateDraftPageAction extends Action<PagesListActionTypes.CreateDraftPage> {
  type: PagesListActionTypes.CreateDraftPage;
  draftPage: PageItem;
}

export interface DeleteDraftPageAction extends Action<PagesListActionTypes.DeleteDraftPage> {
  type: PagesListActionTypes.DeleteDraftPage;
  draftPageId: number;
}

export type PagesListActions =
  | GetPagesListRequestAction
  | GetPagesListSuccessAction
  | GetPagesListErrorAction
  | CreateDraftPageAction
  | DeleteDraftPageAction;
