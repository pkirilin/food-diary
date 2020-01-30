import { combineReducers } from 'redux';
import pagesReducer from './pages';
import notesReducer from './notes';

const rootReducer = combineReducers({
  pages: pagesReducer,
  notes: notesReducer,
});

export default rootReducer;
