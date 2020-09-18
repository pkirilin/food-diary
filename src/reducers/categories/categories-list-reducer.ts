import { CategoriesListState } from '../../store';
import { CategoriesListActions, CategoriesListActionTypes } from '../../action-types';

export const initialState: CategoriesListState = {
  categoryItems: [],
  categoryItemsFetchState: {
    loading: false,
    loaded: false,
  },
  editableCategoriesIds: [],
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
          loading: true,
          loaded: false,
          loadingMessage: action.loadingMessage,
        },
      };
    case CategoriesListActionTypes.Success:
      return {
        ...state,
        categoryItemsFetchState: {
          loading: false,
          loaded: true,
        },
        categoryItems: action.categories,
      };
    case CategoriesListActionTypes.Error:
      return {
        ...state,
        categoryItemsFetchState: {
          loading: false,
          loaded: false,
          error: action.errorMessage,
        },
      };
    case CategoriesListActionTypes.SetEditable:
      return {
        ...state,
        editableCategoriesIds: action.editable
          ? [...state.editableCategoriesIds, ...action.categoriesIds]
          : [...state.editableCategoriesIds.filter(id => !action.categoriesIds.some(aId => aId === id))],
      };
    default:
      return state;
  }
};

export default categoriesListReducer;
