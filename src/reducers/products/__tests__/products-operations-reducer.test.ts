import {
  CreateProductErrorAction,
  CreateProductRequestAction,
  CreateProductSuccessAction,
  DeleteProductErrorAction,
  DeleteProductRequestAction,
  DeleteProductSuccessAction,
  EditProductErrorAction,
  EditProductRequestAction,
  EditProductSuccessAction,
  ProductsOperationsActionTypes,
} from '../../../action-types';
import { ProductsOperationsState } from '../../../store';
import productsOperationsReducer, { initialState } from '../products-operations-reducer';

describe('products operations reducer', () => {
  test('should handle create product request', () => {
    const action: CreateProductRequestAction = {
      type: ProductsOperationsActionTypes.CreateRequest,
      product: {
        name: 'Product',
        caloriesCost: 120,
        categoryId: 1,
      },
      operationMessage: 'Test',
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
    const action: CreateProductSuccessAction = {
      type: ProductsOperationsActionTypes.CreateSuccess,
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
    const action: CreateProductErrorAction = {
      type: ProductsOperationsActionTypes.CreateError,
      error: 'Test',
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
    const action: EditProductRequestAction = {
      type: ProductsOperationsActionTypes.EditRequest,
      request: {
        id: 1,
        product: {
          name: 'Product',
          caloriesCost: 120,
          categoryId: 1,
        },
      },
      operationMessage: 'Test',
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
    const action: EditProductSuccessAction = {
      type: ProductsOperationsActionTypes.EditSuccess,
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
    const action: EditProductErrorAction = {
      type: ProductsOperationsActionTypes.EditError,
      error: 'Test',
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
    const action: DeleteProductRequestAction = {
      type: ProductsOperationsActionTypes.DeleteRequest,
      productId: 1,
      operationMessage: 'Test',
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
    const action: DeleteProductSuccessAction = {
      type: ProductsOperationsActionTypes.DeleteSuccess,
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
    const action: DeleteProductErrorAction = {
      type: ProductsOperationsActionTypes.DeleteError,
      error: 'Test',
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
