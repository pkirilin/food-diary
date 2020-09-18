import { CategoriesDropdownState } from '../../store';
import { CategoriesDropdownActions, CategoriesDropdownActionTypes } from '../../action-types';

export const initialState: CategoriesDropdownState = {
  categoryDropdownItems: [],
  categoryDropdownItemsFetchState: {
    loading: false,
    loaded: false,
  },
};

const categoriesDropdownReducer = (
  state: CategoriesDropdownState = initialState,
  action: CategoriesDropdownActions,
): CategoriesDropdownState => {
  switch (action.type) {
    case CategoriesDropdownActionTypes.Request:
      return {
        ...state,
        categoryDropdownItemsFetchState: {
          loading: true,
          loaded: false,
          loadingMessage: action.loadingMessage,
        },
      };
    case CategoriesDropdownActionTypes.Success:
      return {
        ...state,
        categoryDropdownItems: action.categoryDropdownItems,
        categoryDropdownItemsFetchState: {
          loading: false,
          loaded: true,
        },
      };
    case CategoriesDropdownActionTypes.Error:
      return {
        ...state,
        categoryDropdownItemsFetchState: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
};

export default categoriesDropdownReducer;
