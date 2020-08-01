import { ProductsFilterState } from '../../store';
import { ProductsFilterActions, ProductsFilterActionTypes } from '../../action-types';

const initialState: ProductsFilterState = {
  params: {
    pageSize: 30,
  },
  isChanged: false,
};

const productsFilterReducer = (
  state: ProductsFilterState = initialState,
  action: ProductsFilterActions,
): ProductsFilterState => {
  switch (action.type) {
    case ProductsFilterActionTypes.UpdateFilter:
      return {
        ...state,
        params: action.updatedFilter,
        isChanged: !!action.updatedFilter.productName,
      };
    case ProductsFilterActionTypes.ClearFilter:
      return initialState;
    default:
      return state;
  }
};

export default productsFilterReducer;

export { initialState as productsFilterInitialState };
