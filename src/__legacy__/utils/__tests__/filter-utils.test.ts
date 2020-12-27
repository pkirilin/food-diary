import { SortOrder } from '../../models';
import { invertSortOrder } from '../filter-utils';

const testData = [
  {
    givenSortOrder: SortOrder.Ascending,
    expectedSortOrder: SortOrder.Descending,
  },
  {
    givenSortOrder: SortOrder.Descending,
    expectedSortOrder: SortOrder.Ascending,
  },
];

describe('utils (filter)', () => {
  describe('invertSortOrder', () => {
    testData.forEach(({ givenSortOrder, expectedSortOrder }) => {
      test(`should return inverted sort order from '${givenSortOrder}' to '${expectedSortOrder}'`, () => {
        const result = invertSortOrder(givenSortOrder);

        expect(result).toEqual(expectedSortOrder);
      });
    });
  });
});
