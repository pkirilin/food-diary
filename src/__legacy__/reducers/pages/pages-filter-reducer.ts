import { PagesFilterState } from '../../store';
import { PagesFilterActions, PagesFilterActionTypes } from '../../action-types';
import { SortOrder } from '../../models';

export const initialState: PagesFilterState = {
  params: {
    sortOrder: SortOrder.Descending,
  },
  isChanged: false,
};

const pagesFilterReducer = (state: PagesFilterState = initialState, action: PagesFilterActions): PagesFilterState => {
  switch (action.type) {
    case PagesFilterActionTypes.UpdateFilter:
      return {
        params: action.updatedFilter,
        isChanged: true,
      };
    case PagesFilterActionTypes.ClearFilter:
      return initialState;
    default:
      return state;
  }
};

export default pagesFilterReducer;
