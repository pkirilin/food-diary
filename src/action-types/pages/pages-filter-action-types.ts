import { Action } from 'redux';
import { PageFilter } from '../../models';

export enum PagesFilterActionType {
  UpdateFilter = 'PAGES_FILTER__UPDATE',
}

export interface UpdatePagesFilterAction extends Action<PagesFilterActionType.UpdateFilter> {
  type: PagesFilterActionType.UpdateFilter;
  updatedFilter: PageFilter;
}

export type PagesFilterActions = UpdatePagesFilterAction;
