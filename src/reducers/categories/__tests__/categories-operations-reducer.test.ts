import {
  CategoriesOperationsActionTypes,
  CreateCategoryErrorAction,
  CreateCategoryRequestAction,
  CreateCategorySuccessAction,
  DeleteCategoryErrorAction,
  DeleteCategoryRequestAction,
  DeleteCategorySuccessAction,
  EditCategoryErrorAction,
  EditCategoryRequestAction,
  EditCategorySuccessAction,
} from '../../../action-types';
import { CategoriesOperationsState } from '../../../store';
import categoriesOperationsReducer, { initialState } from '../categories-operations-reducer';

describe('categories operations reducer', () => {
  test('should handle create category request', () => {
    const action: CreateCategoryRequestAction = {
      type: CategoriesOperationsActionTypes.CreateRequest,
      category: {
        name: 'Test',
      },
      operationMessage: 'Test',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: action.operationMessage,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create category success', () => {
    const action: CreateCategorySuccessAction = {
      type: CategoriesOperationsActionTypes.CreateSuccess,
      createdCategoryId: 1,
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create category error', () => {
    const action: CreateCategoryErrorAction = {
      type: CategoriesOperationsActionTypes.CreateError,
      error: 'error',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: action.error,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit category request', () => {
    const action: EditCategoryRequestAction = {
      type: CategoriesOperationsActionTypes.EditRequest,
      request: {
        id: 1,
        category: {
          name: 'Test',
        },
      },
      operationMessage: 'Test',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: true,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit category success', () => {
    const action: EditCategorySuccessAction = {
      type: CategoriesOperationsActionTypes.EditSuccess,
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit category error', () => {
    const action: EditCategoryErrorAction = {
      type: CategoriesOperationsActionTypes.EditError,
      error: 'error',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: action.error,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete category request', () => {
    const action: DeleteCategoryRequestAction = {
      type: CategoriesOperationsActionTypes.DeleteRequest,
      operationMessage: 'Test',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: action.operationMessage,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete category success', () => {
    const action: DeleteCategorySuccessAction = {
      type: CategoriesOperationsActionTypes.DeleteSuccess,
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete category error', () => {
    const action: DeleteCategoryErrorAction = {
      type: CategoriesOperationsActionTypes.DeleteError,
      error: 'error',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: action.error,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
