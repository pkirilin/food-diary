import { UpdatePagesFilterAction, PagesFilterActionType } from '../../action-types';
import { PagesFilter } from '../../models';

export const updateFilterActionCreator = (updatedFilter: PagesFilter): UpdatePagesFilterAction => {
  return {
    type: PagesFilterActionType.UpdateFilter,
    updatedFilter,
  };
};
