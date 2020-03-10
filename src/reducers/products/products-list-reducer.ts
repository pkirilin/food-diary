import { ProductsListState } from '../../store';
import { ProductListActions, ProductsListActionTypes } from '../../action-types';

const initialState: ProductsListState = {
  productItems: [],
  productItemsFetchState: {
    loading: false,
    loaded: false,
  },
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
    default:
      return state;
  }
};

export default productsListReducer;
