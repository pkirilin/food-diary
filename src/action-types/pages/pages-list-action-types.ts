import { Action, ActionCreator } from 'redux';
import { PageItem, PagesFilter } from '../../models';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { ThunkHelperAllActions, ThunkHelperResultActions } from '../../helpers';

export enum PagesListActionTypes {
  Request = 'PAGES_LIST__REQUEST',
  Success = 'PAGES_LIST__SUCCESS',
  Error = 'PAGES_LIST__ERROR',
  SetSelected = 'PAGES_LIST__SET_SELECTED_FOR_PAGE',
  SetSelectedAll = 'PAGES_LIST__SET_SELECTED_FOR_ALL_PAGES',
  SetEditable = 'PAGES_LIST__SET_EDITABLE_FOR_PAGES',
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

export type GetPagesListActions = ThunkHelperAllActions<
  PagesListActionTypes.Request,
  PagesListActionTypes.Success,
  PagesListActionTypes.Error,
  PageItem[],
  PagesFilter
>;

export type GetPagesListResultActions = ThunkHelperResultActions<
  PagesListActionTypes.Success,
  PagesListActionTypes.Error,
  PageItem[],
  PagesFilter
>;

export type PagesListActions =
  | GetPagesListActions
  | SetSelectedForPageAction
  | SetSelectedForAllPagesAction
  | SetEditableForPagesAction;

export type GetPagesListActionCreator = ActionCreator<
  ThunkAction<Promise<GetPagesListResultActions>, PageItem[], PagesFilter, GetPagesListResultActions>
>;

export type GetPagesListDispatch = ThunkDispatch<PageItem[], PagesFilter, GetPagesListResultActions>;

export type GetPagesListDispatchProp = (filter: PagesFilter) => Promise<GetPagesListResultActions>;
