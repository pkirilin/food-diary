import { combineReducers } from 'redux';
import productsDropdownReducer from './products-dropdown-reducer';
import productsListReducer from './products-list-reducer';
import productsOperationsReducer from './products-operations-reducer';
import productsFilterReducer, { productsFilterInitialState } from './products-filter-reducer';

const productsReducer = combineReducers({
  dropdown: productsDropdownReducer,
  list: productsListReducer,
  operations: productsOperationsReducer,
  filter: productsFilterReducer,
});

export default productsReducer;

export { productsFilterInitialState };
