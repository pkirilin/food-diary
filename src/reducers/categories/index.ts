import { combineReducers } from 'redux';
import categoriesDropdownReducer from './categories-dropdown-reducer';
import categoriesListReducer from './categories-list-reducer';
import categoriesOperationsReducer from './categories-operations-reducer';

const categoriesReducer = combineReducers({
  dropdown: categoriesDropdownReducer,
  list: categoriesListReducer,
  operations: categoriesOperationsReducer,
});

export default categoriesReducer;
