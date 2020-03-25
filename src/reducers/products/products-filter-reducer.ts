import { ProductsFilterState } from '../../store';
import { ProductsFilterActions, ProductsFilterActionTypes } from '../../action-types';

const initialState: ProductsFilterState = {
  pageSize: 10,
};

const productsFilterReducer = (
  state: ProductsFilterState = initialState,
  action: ProductsFilterActions,
): ProductsFilterState => {
  switch (action.type) {
    case ProductsFilterActionTypes.UpdateFilter:
      return {
        ...action.updatedFilter,
      };
    case ProductsFilterActionTypes.ClearFilter:
      return initialState;
    default:
      return state;
  }
};

export default productsFilterReducer;
