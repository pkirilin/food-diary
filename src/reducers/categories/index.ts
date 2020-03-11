import { combineReducers } from 'redux';
import categoriesDropdownReducer from './categories-dropdown-reducer';

const categoriesReducer = combineReducers({
  dropdown: categoriesDropdownReducer,
});

export default categoriesReducer;
