import {
  CategoriesListActionTypes,
  GetCategoriesListErrorAction,
  GetCategoriesListRequestAction,
  GetCategoriesListSuccessAction,
  SetEditableForCategoriesAction,
} from '../../../action-types';
import { CategoryItem } from '../../../models';
import { CategoriesListState } from '../../../store';
import categoriesListReducer, { initialState } from '../categories-list-reducer';

function generateTestCategoryItems(): CategoryItem[] {
  return [
    {
      id: 1,
      name: 'Test 1',
      countProducts: 1,
    },
    {
      id: 2,
      name: 'Test 2',
      countProducts: 2,
    },
  ];
}

describe('categories list reducer', () => {
  test('should handle categories list request', () => {
    const action: GetCategoriesListRequestAction = {
      type: CategoriesListActionTypes.Request,
      requestMessage: 'Test',
      payload: {},
    };
    const expectedState: CategoriesListState = {
      ...initialState,
      categoryItemsFetchState: {
        loading: true,
        loaded: false,
        loadingMessage: action.requestMessage,
      },
    };

    const nextState = categoriesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle categories list success', () => {
    const action: GetCategoriesListSuccessAction = {
      type: CategoriesListActionTypes.Success,
      data: generateTestCategoryItems(),
    };
    const expectedState: CategoriesListState = {
      ...initialState,
      categoryItems: action.data,
      categoryItemsFetchState: {
        loading: false,
        loaded: true,
      },
    };

    const nextState = categoriesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle categories list error', () => {
    const action: GetCategoriesListErrorAction = {
      type: CategoriesListActionTypes.Error,
      errorMessage: 'error',
    };
    const expectedState: CategoriesListState = {
      ...initialState,
      categoryItemsFetchState: {
        loading: false,
        loaded: false,
        error: action.errorMessage,
      },
    };

    const nextState = categoriesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle set editable categories ids (adding)', () => {
    const state: CategoriesListState = {
      ...initialState,
      editableCategoriesIds: [3, 4],
    };
    const action: SetEditableForCategoriesAction = {
      type: CategoriesListActionTypes.SetEditable,
      editable: true,
      categoriesIds: [1, 2, 3],
    };
    const expectedState: CategoriesListState = {
      ...initialState,
      editableCategoriesIds: [3, 4, 1, 2, 3],
    };

    const nextState = categoriesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle set editable categories ids (removing)', () => {
    const state: CategoriesListState = {
      ...initialState,
      editableCategoriesIds: [1, 2, 3],
    };
    const action: SetEditableForCategoriesAction = {
      type: CategoriesListActionTypes.SetEditable,
      editable: false,
      categoriesIds: [1, 3],
    };
    const expectedState: CategoriesListState = {
      ...initialState,
      editableCategoriesIds: [2],
    };

    const nextState = categoriesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
