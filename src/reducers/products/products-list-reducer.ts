import { ProductsListState } from '../../store';
import { ProductListActions, ProductsListActionTypes } from '../../action-types';

const initialState: ProductsListState = {
  productItems: [],
  productItemsFetchState: {
    loading: false,
    loaded: false,
  },
  editableProductsIds: [],
};

const productsListReducer = (
  state: ProductsListState = initialState,
  action: ProductListActions,
): ProductsListState => {
  switch (action.type) {
    case ProductsListActionTypes.Request:
      return {
        ...state,
        productItemsFetchState: {
          ...state.productItemsFetchState,
          loading: true,
          loaded: false,
        },
      };
    case ProductsListActionTypes.Success:
      return {
        ...state,
        productItems: action.productItems,
        productItemsFetchState: {
          ...state.productItemsFetchState,
          loading: false,
          loaded: true,
        },
      };
    case ProductsListActionTypes.Error:
      return {
        ...state,
        productItemsFetchState: {
          ...state.productItemsFetchState,
          loading: false,
          loaded: false,
          error: action.errorMessage,
        },
      };

    case ProductsListActionTypes.SetEditable:
      return {
        ...state,
        editableProductsIds: action.editable
          ? [...state.editableProductsIds, action.productId]
          : [...state.editableProductsIds.filter(id => id !== action.productId)],
      };
    default:
      return state;
  }
};

export default productsListReducer;
