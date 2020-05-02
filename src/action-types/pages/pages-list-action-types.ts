import { Action, ActionCreator } from 'redux';
import { PageItem, PagesFilter } from '../../models';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

export enum PagesListActionTypes {
  Request = 'PAGES_LIST__REQUEST',
  Success = 'PAGES_LIST__SUCCESS',
  Error = 'PAGES_LIST__ERROR',
  CreateDraftPage = 'PAGES_LIST__CREATE_DRAFT_PAGE',
  DeleteDraftPage = 'PAGES_LIST__DELETE_DRAFT_PAGE',
  SetSelected = 'PAGES_LIST__SET_SELECTED_FOR_PAGE',
  SetSelectedAll = 'PAGES_LIST__SET_SELECTED_FOR_ALL_PAGES',
  SetEditable = 'PAGES_LIST__SET_EDITABLE_FOR_PAGES',
}

export interface GetPagesListRequestAction extends Action<PagesListActionTypes.Request> {
  type: PagesListActionTypes.Request;
  loadingMessage?: string;
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

export interface SetSelectedForPageAction extends Action<PagesListActionTypes.SetSelected> {
  type: PagesListActionTypes.SetSelected;
  selected: boolean;
  pageId: number;
}

export interface SetSelectedForAllPagesAction extends Action<PagesListActionTypes.SetSelectedAll> {
  type: PagesListActionTypes.SetSelectedAll;
  selected: boolean;
}

export interface SetEditableForPagesAction extends Action<PagesListActionTypes.SetEditable> {
  type: PagesListActionTypes.SetEditable;
  pagesIds: number[];
  editable: boolean;
}

export type GetPagesListActions = GetPagesListRequestAction | GetPagesListSuccessAction | GetPagesListErrorAction;

export type PagesListActions =
  | GetPagesListActions
  | CreateDraftPageAction
  | DeleteDraftPageAction
  | SetSelectedForPageAction
  | SetSelectedForAllPagesAction
  | SetEditableForPagesAction;

export type GetPagesListActionCreator = ActionCreator<
  ThunkAction<
    Promise<GetPagesListSuccessAction | GetPagesListErrorAction>,
    PageItem[],
    PagesFilter,
    GetPagesListSuccessAction | GetPagesListErrorAction
  >
>;

export type GetPagesListDispatch = ThunkDispatch<
  PageItem[],
  PagesFilter,
  GetPagesListSuccessAction | GetPagesListErrorAction
>;

export type GetPagesListDispatchProp = (
  filter: PagesFilter,
) => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
