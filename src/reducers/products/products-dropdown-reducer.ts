import { ProductsDropdownState } from '../../store';
import { ProductsDropdownActions, ProductsDropdownActionTypes } from '../../action-types';

const initialState: ProductsDropdownState = {
  productDropdownItems: [],
  productDropdownItemsFetchState: {
    loading: false,
    loaded: false,
  },
};

const productsDropdownReducer = (
  state: ProductsDropdownState = initialState,
  action: ProductsDropdownActions,
): ProductsDropdownState => {
  switch (action.type) {
    case ProductsDropdownActionTypes.Request:
      return {
        ...state,
        productDropdownItemsFetchState: {
          loading: true,
          loaded: false,
          loadingMessage: action.loadingMessage,
        },
      };
    case ProductsDropdownActionTypes.Success:
      return {
        ...state,
        productDropdownItems: action.productDropdownItems,
        productDropdownItemsFetchState: {
          loading: false,
          loaded: true,
        },
      };
    case ProductsDropdownActionTypes.Error:
      return {
        ...state,
        productDropdownItemsFetchState: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
};

export default productsDropdownReducer;
