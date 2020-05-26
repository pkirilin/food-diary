import { PagesFilterState } from '../../store';
import { PagesFilterActions, PagesFilterActionTypes } from '../../action-types';
import { SortOrder } from '../../models';
import { formatDate, DateFormat } from '../../utils/date-utils';

function getInitialStartDate(): string {
  // Getting initial start date as current date minus 1 month
  const curDate = new Date();
  curDate.setMonth(curDate.getMonth() - 1);
  return formatDate(curDate, DateFormat.DashYMD);
}

const initialState: PagesFilterState = {
  params: {
    startDate: getInitialStartDate(),
    sortOrder: SortOrder.Descending,
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
