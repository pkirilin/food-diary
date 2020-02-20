import { combineReducers } from 'redux';
import pagesReducer from './pages';
import notesReducer from './notes';
import mealsReducer from './meals';
import productsReducer from './products';

const rootReducer = combineReducers({
  pages: pagesReducer,
  notes: notesReducer,
  meals: mealsReducer,
  products: productsReducer,
});

export default rootReducer;
