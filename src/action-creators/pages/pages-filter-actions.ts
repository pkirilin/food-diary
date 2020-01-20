import { UpdatePagesFilterAction, PagesFilterActionType, ClearPagesFilterAction } from '../../action-types';
import { PagesFilter } from '../../models';

export const updateFilterActionCreator = (updatedFilter: PagesFilter): UpdatePagesFilterAction => {
  return {
    type: PagesFilterActionType.UpdateFilter,
    updatedFilter,
  };
};

export const clearFilterActionCreator = (): ClearPagesFilterAction => {
  return {
    type: PagesFilterActionType.ClearFilter,
  };
};
