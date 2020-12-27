import { ProductsListActionTypes } from '../../../action-types';
import { ErrorAction, RequestAction, SuccessAction } from '../../../helpers';
import { ProductItem, ProductItemsWithTotalCount, ProductsFilter } from '../../../models';
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
    const action: RequestAction<ProductsListActionTypes.Request, ProductsFilter> = {
      type: ProductsListActionTypes.Request,
      requestMessage: 'Test',
      payload: { pageSize: 10 },
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
    const action: SuccessAction<ProductsListActionTypes.Success, ProductItemsWithTotalCount, ProductsFilter> = {
      type: ProductsListActionTypes.Success,
      data: {
        productItems: generateTestProducts(),
        totalProductsCount: 123,
      },
      payload: { pageSize: 10 },
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
    const action: ErrorAction<ProductsListActionTypes.Error, ProductsFilter> = {
      type: ProductsListActionTypes.Error,
      errorMessage: 'Test',
      payload: { pageSize: 10 },
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
