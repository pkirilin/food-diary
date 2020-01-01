import { combineReducers } from 'redux';
import pagesListReducer from './pages-list-reducer';

const pagesReducer = combineReducers({
  list: pagesListReducer,
});

export default pagesReducer;
