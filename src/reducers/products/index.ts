import { combineReducers } from 'redux';
import productsDropdownReducer from './products-dropdown-reducer';
import productsListReducer from './products-list-reducer';
import productsOperationsReducer from './products-operations-reducer';

const productsReducer = combineReducers({
  dropdown: productsDropdownReducer,
  list: productsListReducer,
  operations: productsOperationsReducer,
});

export default productsReducer;
