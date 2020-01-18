import { UpdatePagesFilterAction, PagesFilterActionType } from '../../action-types';
import { PagesFilter } from '../../models';
import { ActionCreator } from 'redux';

export const updateFilterActionCreator: ActionCreator<UpdatePagesFilterAction> = (updatedFilter: PagesFilter) => {
  return {
    type: PagesFilterActionType.UpdateFilter,
    updatedFilter,
  };
};
