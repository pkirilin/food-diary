import { ClearPagesFilterAction, PagesFilterActionTypes, UpdatePagesFilterAction } from '../../../action-types';
import { PagesFilter, SortOrder } from '../../../models';
import { PagesFilterState } from '../../../store';
import pagesFilterReducer, { initialState } from '../pages-filter-reducer';

function generateTestFilter(): PagesFilter {
  return {
    sortOrder: SortOrder.Ascending,
    startDate: '2020-10-05',
    endDate: '2020-10-06',
  };
}

describe('pages filter reducer', () => {
  test('should handle update filter', () => {
    const action: UpdatePagesFilterAction = {
      type: PagesFilterActionTypes.UpdateFilter,
      updatedFilter: generateTestFilter(),
    };
    const expectedState: PagesFilterState = {
      params: generateTestFilter(),
      isChanged: true,
    };

    const nextState = pagesFilterReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle clear filter', () => {
    const state: PagesFilterState = {
      params: generateTestFilter(),
      isChanged: true,
    };
    const action: ClearPagesFilterAction = {
      type: PagesFilterActionTypes.ClearFilter,
    };

    const nextState = pagesFilterReducer(state, action);

    expect(nextState).toMatchObject(initialState);
  });
});
