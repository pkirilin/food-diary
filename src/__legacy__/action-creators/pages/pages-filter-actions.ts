import { UpdatePagesFilterAction, PagesFilterActionTypes, ClearPagesFilterAction } from '../../action-types';
import { PagesFilter } from '../../models';

export const updateFilter = (updatedFilter: PagesFilter): UpdatePagesFilterAction => {
  return {
    type: PagesFilterActionTypes.UpdateFilter,
    updatedFilter,
  };
};

export const clearFilter = (): ClearPagesFilterAction => {
  return {
    type: PagesFilterActionTypes.ClearFilter,
  };
};
