import { combineReducers } from 'redux';
import pagesListReducer from './pages-list-reducer';
import pagesFilterReducer from './pages-filter-reducer';

const pagesReducer = combineReducers({
  list: pagesListReducer,
  filter: pagesFilterReducer,
});

export default pagesReducer;
