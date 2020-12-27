import {
  CategoriesDropdownActionTypes,
  GetCategoryDropdownItemsErrorAction,
  GetCategoryDropdownItemsRequestAction,
  GetCategoryDropdownItemsSuccessAction,
} from '../../../action-types';
import { CategoryDropdownItem } from '../../../models';
import { CategoriesDropdownState } from '../../../store';
import categoriesDropdownReducer, { initialState } from '../categories-dropdown-reducer';

function generateTestDropdownItems(): CategoryDropdownItem[] {
  return [
    {
      id: 1,
      name: 'Test 1',
    },
    {
      id: 2,
      name: 'Test 2',
    },
  ];
}

describe('categories dropdown reducer', () => {
  test('should handle dropdown items request', () => {
    const action: GetCategoryDropdownItemsRequestAction = {
      type: CategoriesDropdownActionTypes.Request,
      requestMessage: 'Test loading message',
      payload: {},
    };
    const expectedState: CategoriesDropdownState = {
      ...initialState,
      categoryDropdownItemsFetchState: {
        loading: true,
        loaded: false,
        loadingMessage: action.requestMessage,
      },
    };

    const nextState = categoriesDropdownReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle dropdown items success', () => {
    const action: GetCategoryDropdownItemsSuccessAction = {
      type: CategoriesDropdownActionTypes.Success,
      data: generateTestDropdownItems(),
    };
    const expectedState: CategoriesDropdownState = {
      ...initialState,
      categoryDropdownItems: action.data,
      categoryDropdownItemsFetchState: {
        loading: false,
        loaded: true,
      },
    };

    const nextState = categoriesDropdownReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle dropdown items error', () => {
    const action: GetCategoryDropdownItemsErrorAction = {
      type: CategoriesDropdownActionTypes.Error,
      errorMessage: 'Error',
    };

    const expectedState: CategoriesDropdownState = {
      ...initialState,
      categoryDropdownItemsFetchState: {
        loading: false,
        loaded: false,
        error: action.errorMessage,
      },
    };

    const nextState = categoriesDropdownReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
