import { PagesFilterState } from '../../store';
import { PagesFilterActions, PagesFilterActionType } from '../../action-types';
import { SortOrder, ShowCount } from '../../models';

const initialState: PagesFilterState = {
  sortOrder: SortOrder.Descending,
  showCount: ShowCount.LastMonth,
};

const pagesFilterReducer = (state: PagesFilterState = initialState, action: PagesFilterActions): PagesFilterState => {
  switch (action.type) {
    case PagesFilterActionType.UpdateFilter:
      return {
        ...state,
        ...action.updatedFilter,
      };
    default:
      return state;
  }
};

export default pagesFilterReducer;
