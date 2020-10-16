import {
  GetProductDropdownItemsErrorAction,
  GetProductDropdownItemsRequestAction,
  GetProductDropdownItemsSuccessAction,
  ProductsDropdownActionTypes,
} from '../../../action-types';
import { ProductDropdownItem } from '../../../models';
import { ProductsDropdownState } from '../../../store';
import productsDropdownReducer, { initialState } from '../products-dropdown-reducer';

function generateTestDropdownItems(): ProductDropdownItem[] {
  return [
    {
      id: 1,
      name: 'Product 1',
    },
    {
      id: 2,
      name: 'Product 2',
    },
  ];
}

describe('products dropdown reducer', () => {
  test('should handle dropdown items request', () => {
    const action: GetProductDropdownItemsRequestAction = {
      type: ProductsDropdownActionTypes.Request,
      loadingMessage: 'Test',
    };
    const expectedState: ProductsDropdownState = {
      ...initialState,
      productDropdownItemsFetchState: {
        loading: true,
        loaded: false,
        loadingMessage: 'Test',
      },
    };

    const nextState = productsDropdownReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle dropdown items success', () => {
    const action: GetProductDropdownItemsSuccessAction = {
      type: ProductsDropdownActionTypes.Success,
      productDropdownItems: generateTestDropdownItems(),
    };
    const expectedState: ProductsDropdownState = {
      ...initialState,
      productDropdownItems: generateTestDropdownItems(),
      productDropdownItemsFetchState: {
        loading: false,
        loaded: true,
      },
    };

    const nextState = productsDropdownReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle dropdown items error', () => {
    const action: GetProductDropdownItemsErrorAction = {
      type: ProductsDropdownActionTypes.Error,
      error: 'Test',
    };
    const expectedState: ProductsDropdownState = {
      ...initialState,
      productDropdownItemsFetchState: {
        loading: false,
        loaded: false,
        error: 'Test',
      },
    };

    const nextState = productsDropdownReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
