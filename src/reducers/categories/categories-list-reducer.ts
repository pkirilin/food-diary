import { CategoriesListState } from '../../store';
import { CategoriesListActions, CategoriesListActionTypes } from '../../action-types';

const initialState: CategoriesListState = {
  categoryItems: [],
  categoryItemsFetchState: {
    loading: false,
    loaded: false,
  },
};

const categoriesListReducer = (
  state: CategoriesListState = initialState,
  action: CategoriesListActions,
): CategoriesListState => {
  switch (action.type) {
    case CategoriesListActionTypes.Request:
      return {
        ...state,
        categoryItemsFetchState: {
          ...state.categoryItemsFetchState,
          loading: true,
          loaded: false,
        },
      };
    case CategoriesListActionTypes.Success:
      return {
        ...state,
        categoryItemsFetchState: {
          ...state.categoryItemsFetchState,
          loading: false,
          loaded: true,
        },
        categoryItems: action.categories,
      };
    case CategoriesListActionTypes.Error:
      return {
        ...state,
        categoryItemsFetchState: {
          ...state.categoryItemsFetchState,
          loading: false,
          loaded: false,
          error: action.errorMessage,
        },
      };
    default:
      return state;
  }
};

export default categoriesListReducer;
