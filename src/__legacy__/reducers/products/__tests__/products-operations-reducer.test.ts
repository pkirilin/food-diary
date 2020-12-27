import { ProductsOperationsActionTypes } from '../../../action-types';
import { ErrorAction, RequestAction, SuccessAction } from '../../../helpers';
import { ProductCreateEdit, ProductEditRequest } from '../../../models';
import { ProductsOperationsState } from '../../../store';
import productsOperationsReducer, { initialState } from '../products-operations-reducer';

describe('products operations reducer', () => {
  test('should handle create product request', () => {
    const action: RequestAction<ProductsOperationsActionTypes.CreateRequest, ProductCreateEdit> = {
      type: ProductsOperationsActionTypes.CreateRequest,
      payload: {
        name: 'Product',
        caloriesCost: 120,
        categoryId: 1,
      },
      requestMessage: 'Test',
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: true,
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create product success', () => {
    const action: SuccessAction<ProductsOperationsActionTypes.CreateSuccess, {}, ProductCreateEdit> = {
      type: ProductsOperationsActionTypes.CreateSuccess,
      data: {},
      payload: {
        name: 'Product',
        caloriesCost: 120,
        categoryId: 1,
      },
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: false,
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create product error', () => {
    const action: ErrorAction<ProductsOperationsActionTypes.CreateError, ProductCreateEdit> = {
      type: ProductsOperationsActionTypes.CreateError,
      errorMessage: 'Test',
      payload: {
        name: 'Product',
        caloriesCost: 120,
        categoryId: 1,
      },
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit product request', () => {
    const action: RequestAction<ProductsOperationsActionTypes.EditRequest, ProductEditRequest> = {
      type: ProductsOperationsActionTypes.EditRequest,
      payload: {
        id: 1,
        product: {
          name: 'Product',
          caloriesCost: 120,
          categoryId: 1,
        },
      },
      requestMessage: 'Test',
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: true,
        message: 'Test',
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit product success', () => {
    const action: SuccessAction<ProductsOperationsActionTypes.EditSuccess, {}, ProductEditRequest> = {
      type: ProductsOperationsActionTypes.EditSuccess,
      data: {},
      payload: {
        id: 1,
        product: {
          name: 'Product',
          caloriesCost: 120,
          categoryId: 1,
        },
      },
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: false,
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit product error', () => {
    const action: ErrorAction<ProductsOperationsActionTypes.EditError, ProductEditRequest> = {
      type: ProductsOperationsActionTypes.EditError,
      errorMessage: 'Test',
      payload: {
        id: 1,
        product: {
          name: 'Product',
          caloriesCost: 120,
          categoryId: 1,
        },
      },
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete product request', () => {
    const action: RequestAction<ProductsOperationsActionTypes.DeleteRequest, number> = {
      type: ProductsOperationsActionTypes.DeleteRequest,
      payload: 1,
      requestMessage: 'Test',
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: true,
        message: 'Test',
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete product success', () => {
    const action: SuccessAction<ProductsOperationsActionTypes.DeleteSuccess, {}, number> = {
      type: ProductsOperationsActionTypes.DeleteSuccess,
      data: {},
      payload: 1,
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: false,
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete product error', () => {
    const action: ErrorAction<ProductsOperationsActionTypes.DeleteError, number> = {
      type: ProductsOperationsActionTypes.DeleteError,
      errorMessage: 'Test',
      payload: 1,
    };
    const expectedState: ProductsOperationsState = {
      productOperationStatus: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = productsOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
