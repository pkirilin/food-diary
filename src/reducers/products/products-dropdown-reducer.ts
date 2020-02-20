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
          ...state.productDropdownItemsFetchState,
          loading: true,
          loaded: false,
        },
      };
    case ProductsDropdownActionTypes.Success:
      return {
        ...state,
        productDropdownItems: action.productDropdownItems,
        productDropdownItemsFetchState: {
          ...state.productDropdownItemsFetchState,
          loading: false,
          loaded: true,
        },
      };
    case ProductsDropdownActionTypes.Error:
      return {
        ...state,
        productDropdownItemsFetchState: {
          ...state.productDropdownItemsFetchState,
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    default:
      return { ...state };
  }
};

export default productsDropdownReducer;
