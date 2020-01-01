import { combineReducers } from 'redux';
import pagesReducer from './pages';

const rootReducer = combineReducers({
  pages: pagesReducer,
});

export default rootReducer;
