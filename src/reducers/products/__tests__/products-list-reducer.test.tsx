import {
  GetProductsListErrorAction,
  GetProductsListRequestAction,
  GetProductsListSuccessAction,
  ProductsListActionTypes,
} from '../../../action-types';
import { ProductItem } from '../../../models';
import { ProductsListState } from '../../../store';
import productsListReducer, { initialState } from '../products-list-reducer';

function generateTestProducts(): ProductItem[] {
  return [
    {
      id: 1,
      name: 'Product 1',
      caloriesCost: 120,
      categoryId: 1,
      categoryName: 'Category 1',
    },
    {
      id: 2,
      name: 'Product 2',
      caloriesCost: 250,
      categoryId: 2,
      categoryName: 'Category 2',
    },
  ];
}

describe('products list reducer', () => {
  test('should handle products list request', () => {
    const action: GetProductsListRequestAction = {
      type: ProductsListActionTypes.Request,
      loadingMessage: 'Test',
    };
    const expectedState: ProductsListState = {
      ...initialState,
      productItemsFetchState: {
        loading: true,
        loaded: false,
        loadingMessage: 'Test',
      },
    };

    const nextState = productsListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle products list success', () => {
    const action: GetProductsListSuccessAction = {
      type: ProductsListActionTypes.Success,
      productItems: generateTestProducts(),
      totalProductsCount: 123,
    };
    const expectedState: ProductsListState = {
      ...initialState,
      productItemsFetchState: {
        loading: false,
        loaded: true,
      },
      productItems: generateTestProducts(),
      totalProductsCount: 123,
    };

    const nextState = productsListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle products list error', () => {
    const action: GetProductsListErrorAction = {
      type: ProductsListActionTypes.Error,
      errorMessage: 'Test',
    };
    const expectedState: ProductsListState = {
      ...initialState,
      productItemsFetchState: {
        loading: false,
        loaded: false,
        error: 'Test',
      },
    };

    const nextState = productsListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
