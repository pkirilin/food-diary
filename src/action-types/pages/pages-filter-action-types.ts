import { Action } from 'redux';
import { PagesFilter } from '../../models';

export enum PagesFilterActionType {
  UpdateFilter = 'PAGES_FILTER__UPDATE',
  ClearFilter = 'PAGES_FILTER__CLEAR',
}

export interface UpdatePagesFilterAction extends Action<PagesFilterActionType.UpdateFilter> {
  type: PagesFilterActionType.UpdateFilter;
  updatedFilter: PagesFilter;
}

export interface ClearPagesFilterAction extends Action<PagesFilterActionType.ClearFilter> {
  type: PagesFilterActionType.ClearFilter;
}

export type PagesFilterActions = UpdatePagesFilterAction | ClearPagesFilterAction;
