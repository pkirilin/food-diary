import {
  ClearProductsFilterAction,
  ProductsFilterActionTypes,
  UpdateProductsFilterAction,
} from '../../../action-types';
import { ProductsFilterState } from '../../../store';
import productsFilterReducer, { initialState } from '../products-filter-reducer';

describe('products filter reducer', () => {
  test('should handle update filter', () => {
    const action: UpdateProductsFilterAction = {
      type: ProductsFilterActionTypes.UpdateFilter,
      updatedFilter: {
        pageNumber: 2,
        pageSize: 10,
        categoryId: 1,
        productName: 'Test product',
      },
    };
    const expectedState: ProductsFilterState = {
      isChanged: true,
      params: { ...action.updatedFilter },
    };

    const nextState = productsFilterReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle clear filter', () => {
    const action: ClearProductsFilterAction = {
      type: ProductsFilterActionTypes.ClearFilter,
    };

    const nextState = productsFilterReducer(initialState, action);

    expect(nextState).toMatchObject(initialState);
  });
});
