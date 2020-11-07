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
      payload: {
        name: 'Test',
      },
      requestMessage: 'Test',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: action.requestMessage,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create category success', () => {
    const action: CreateCategorySuccessAction = {
      type: CategoriesOperationsActionTypes.CreateSuccess,
      data: 1,
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
      errorMessage: 'error',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: action.errorMessage,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit category request', () => {
    const action: EditCategoryRequestAction = {
      type: CategoriesOperationsActionTypes.EditRequest,
      payload: {
        id: 1,
        category: {
          name: 'Test',
        },
      },
      requestMessage: 'Test',
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
      data: {},
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
      errorMessage: 'error',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: action.errorMessage,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete category request', () => {
    const action: DeleteCategoryRequestAction = {
      type: CategoriesOperationsActionTypes.DeleteRequest,
      requestMessage: 'Test',
      payload: 1,
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: action.requestMessage,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete category success', () => {
    const action: DeleteCategorySuccessAction = {
      type: CategoriesOperationsActionTypes.DeleteSuccess,
      data: {},
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
      errorMessage: 'error',
    };
    const expectedState: CategoriesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: action.errorMessage,
      },
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
