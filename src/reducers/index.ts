import { combineReducers } from 'redux';
import pagesReducer from './pages';
import notesReducer from './notes';
import mealsReducer from './meals';

const rootReducer = combineReducers({
  pages: pagesReducer,
  notes: notesReducer,
  meals: mealsReducer,
});

export default rootReducer;
