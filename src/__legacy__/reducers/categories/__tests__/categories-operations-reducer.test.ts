import { CategoriesOperationsActionTypes } from '../../../action-types';
import { ErrorAction, RequestAction, SuccessAction } from '../../../helpers';
import { CategoryCreateEdit, CategoryEditRequest } from '../../../models';
import { CategoriesOperationsState } from '../../../store';
import categoriesOperationsReducer, { initialState } from '../categories-operations-reducer';

describe('categories operations reducer', () => {
  test('should handle create category request', () => {
    const action: RequestAction<CategoriesOperationsActionTypes.CreateRequest, CategoryCreateEdit> = {
      type: CategoriesOperationsActionTypes.CreateRequest,
      payload: { name: 'Test' },
      requestMessage: 'Test',
    };
    const expectedState: CategoriesOperationsState = {
      status: {
        performing: true,
        message: action.requestMessage,
      },
      completionStatus: 'idle',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create category success', () => {
    const action: SuccessAction<CategoriesOperationsActionTypes.CreateSuccess, number, CategoryCreateEdit> = {
      type: CategoriesOperationsActionTypes.CreateSuccess,
      data: 1,
      payload: { name: 'test category' },
    };
    const expectedState: CategoriesOperationsState = {
      status: { performing: false },
      completionStatus: 'created',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create category error', () => {
    const action: ErrorAction<CategoriesOperationsActionTypes.CreateError, CategoryCreateEdit> = {
      type: CategoriesOperationsActionTypes.CreateError,
      errorMessage: 'error',
      payload: { name: 'test category' },
    };
    const expectedState: CategoriesOperationsState = {
      status: {
        performing: false,
        error: action.errorMessage,
      },
      completionStatus: 'idle',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit category request', () => {
    const action: RequestAction<CategoriesOperationsActionTypes.EditRequest, CategoryEditRequest> = {
      type: CategoriesOperationsActionTypes.EditRequest,
      payload: {
        id: 1,
        category: { name: 'Test' },
      },
      requestMessage: 'Test',
    };
    const expectedState: CategoriesOperationsState = {
      status: { performing: true },
      completionStatus: 'idle',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit category success', () => {
    const action: SuccessAction<CategoriesOperationsActionTypes.EditSuccess, {}, CategoryEditRequest> = {
      type: CategoriesOperationsActionTypes.EditSuccess,
      data: {},
      payload: {
        id: 1,
        category: { name: 'test category' },
      },
    };
    const expectedState: CategoriesOperationsState = {
      status: { performing: false },
      completionStatus: 'updated',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit category error', () => {
    const action: ErrorAction<CategoriesOperationsActionTypes.EditError, CategoryEditRequest> = {
      type: CategoriesOperationsActionTypes.EditError,
      errorMessage: 'error',
      payload: {
        id: 1,
        category: { name: 'test category' },
      },
    };
    const expectedState: CategoriesOperationsState = {
      status: {
        performing: false,
        error: action.errorMessage,
      },
      completionStatus: 'idle',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete category request', () => {
    const action: RequestAction<CategoriesOperationsActionTypes.DeleteRequest, number> = {
      type: CategoriesOperationsActionTypes.DeleteRequest,
      requestMessage: 'Test',
      payload: 1,
    };
    const expectedState: CategoriesOperationsState = {
      status: {
        performing: true,
        message: action.requestMessage,
      },
      completionStatus: 'idle',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete category success', () => {
    const action: SuccessAction<CategoriesOperationsActionTypes.DeleteSuccess, {}, number> = {
      type: CategoriesOperationsActionTypes.DeleteSuccess,
      data: {},
      payload: 1,
    };
    const expectedState: CategoriesOperationsState = {
      status: { performing: false },
      completionStatus: 'deleted',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete category error', () => {
    const action: ErrorAction<CategoriesOperationsActionTypes.DeleteError, number> = {
      type: CategoriesOperationsActionTypes.DeleteError,
      errorMessage: 'error',
      payload: 1,
    };
    const expectedState: CategoriesOperationsState = {
      status: {
        performing: false,
        error: action.errorMessage,
      },
      completionStatus: 'idle',
    };

    const nextState = categoriesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
