import { Action } from 'redux';
import { PagesFilter } from '../../models';

export enum PagesFilterActionTypes {
  UpdateFilter = 'PAGES_FILTER__UPDATE',
  ClearFilter = 'PAGES_FILTER__CLEAR',
}

export interface UpdatePagesFilterAction extends Action<PagesFilterActionTypes.UpdateFilter> {
  type: PagesFilterActionTypes.UpdateFilter;
  updatedFilter: PagesFilter;
}

export interface ClearPagesFilterAction extends Action<PagesFilterActionTypes.ClearFilter> {
  type: PagesFilterActionTypes.ClearFilter;
}

export type PagesFilterActions = UpdatePagesFilterAction | ClearPagesFilterAction;
