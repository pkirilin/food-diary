import { ClearPagesFilterAction, PagesFilterActionTypes, UpdatePagesFilterAction } from '../../../action-types';
import { PagesFilter, SortOrder } from '../../../models';
import { updateFilter, clearFilter } from '../pages-filter-actions';

describe('pages filter action creators', () => {
  describe('updateFilter', () => {
    test(`should return '${PagesFilterActionTypes.UpdateFilter}' action`, () => {
      const filter: PagesFilter = {
        startDate: '2020-10-24',
        endDate: '2020-10-25',
        sortOrder: SortOrder.Ascending,
      };
      const expectedAction: UpdatePagesFilterAction = {
        type: PagesFilterActionTypes.UpdateFilter,
        updatedFilter: filter,
      };

      const action = updateFilter(filter);

      expect(action).toMatchObject(expectedAction);
    });
  });

  describe('clearFilter', () => {
    test(`should return '${PagesFilterActionTypes.ClearFilter}' action`, () => {
      const expectedAction: ClearPagesFilterAction = {
        type: PagesFilterActionTypes.ClearFilter,
      };

      const action = clearFilter();

      expect(action).toMatchObject(expectedAction);
    });
  });
});
