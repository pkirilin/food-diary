import { combineReducers } from 'redux';
import categoriesDropdownReducer from './categories-dropdown-reducer';
import categoriesListReducer from './categories-list-reducer';

const categoriesReducer = combineReducers({
  dropdown: categoriesDropdownReducer,
  list: categoriesListReducer,
});

export default categoriesReducer;
