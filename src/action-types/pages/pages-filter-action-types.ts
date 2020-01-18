import { Action } from 'redux';
import { PagesFilter } from '../../models';

export enum PagesFilterActionType {
  UpdateFilter = 'PAGES_FILTER__UPDATE',
}

export interface UpdatePagesFilterAction extends Action<PagesFilterActionType.UpdateFilter> {
  type: PagesFilterActionType.UpdateFilter;
  updatedFilter: PagesFilter;
}

export type PagesFilterActions = UpdatePagesFilterAction;
