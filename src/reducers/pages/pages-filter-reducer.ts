import { PagesFilterState } from '../../store';
import { PagesFilterActions, PagesFilterActionTypes } from '../../action-types';
import { SortOrder, ShowCount } from '../../models';

const initialState: PagesFilterState = {
  params: {
    sortOrder: SortOrder.Descending,
    showCount: ShowCount.LastMonth,
  },
  isChanged: false,
};

const pagesFilterReducer = (state: PagesFilterState = initialState, action: PagesFilterActions): PagesFilterState => {
  switch (action.type) {
    case PagesFilterActionTypes.UpdateFilter:
      return {
        ...state,
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
