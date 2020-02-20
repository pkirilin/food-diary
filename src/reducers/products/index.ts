import { combineReducers } from 'redux';
import productsDropdownReducer from './products-dropdown-reducer';

const productsReducer = combineReducers({
  dropdown: productsDropdownReducer,
});

export default productsReducer;
