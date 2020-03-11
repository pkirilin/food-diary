import { combineReducers } from 'redux';
import pagesReducer from './pages';
import notesReducer from './notes';
import mealsReducer from './meals';
import productsReducer from './products';
import categoriesReducer from './categories';

const rootReducer = combineReducers({
  pages: pagesReducer,
  notes: notesReducer,
  meals: mealsReducer,
  products: productsReducer,
  categories: categoriesReducer,
});

export default rootReducer;
