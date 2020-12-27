import { combineReducers } from 'redux';
import pagesListReducer from './pages-list-reducer';
import pagesFilterReducer from './pages-filter-reducer';
import pagesOperationsReducer from './pages-operations-reducer';

const pagesReducer = combineReducers({
  list: pagesListReducer,
  filter: pagesFilterReducer,
  operations: pagesOperationsReducer,
});

export default pagesReducer;
