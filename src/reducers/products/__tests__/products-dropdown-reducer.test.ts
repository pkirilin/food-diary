import { ProductsDropdownActionTypes } from '../../../action-types';
import { ErrorAction, RequestAction, SuccessAction } from '../../../helpers';
import { ProductDropdownItem, ProductDropdownSearchRequest } from '../../../models';
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
    const action: RequestAction<ProductsDropdownActionTypes.Request, ProductDropdownSearchRequest> = {
      type: ProductsDropdownActionTypes.Request,
      requestMessage: 'Test',
      payload: {},
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
    const action: SuccessAction<ProductsDropdownActionTypes.Success, ProductDropdownItem[]> = {
      type: ProductsDropdownActionTypes.Success,
      data: generateTestDropdownItems(),
      payload: {},
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
    const action: ErrorAction<ProductsDropdownActionTypes.Error, ProductDropdownSearchRequest> = {
      type: ProductsDropdownActionTypes.Error,
      errorMessage: 'Test',
      payload: {},
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
