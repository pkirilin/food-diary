import { PagesFilterState } from '../../store';
import { PagesFilterActions, PagesFilterActionTypes } from '../../action-types';
import { SortOrder, ShowCount } from '../../models';

const initialState: PagesFilterState = {
  sortOrder: SortOrder.Descending,
  showCount: ShowCount.LastMonth,
  filterChanged: false,
};

const pagesFilterReducer = (state: PagesFilterState = initialState, action: PagesFilterActions): PagesFilterState => {
  switch (action.type) {
    case PagesFilterActionTypes.UpdateFilter:
      return {
        ...state,
        ...action.updatedFilter,
        filterChanged: true,
      };
    case PagesFilterActionTypes.ClearFilter:
      return initialState;
    default:
      return state;
  }
};

export default pagesFilterReducer;
