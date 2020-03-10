import { combineReducers } from 'redux';
import productsDropdownReducer from './products-dropdown-reducer';
import productsListReducer from './products-list-reducer';

const productsReducer = combineReducers({
  dropdown: productsDropdownReducer,
  list: productsListReducer,
});

export default productsReducer;
