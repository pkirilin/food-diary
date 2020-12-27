import { combineReducers } from 'redux';
import pagesReducer from './pages';
import notesReducer from './notes';
import mealsReducer from './meals';
import productsReducer from './products';
import categoriesReducer from './categories';
import modalReducer from './modal-reducer';

const rootReducer = combineReducers({
  pages: pagesReducer,
  notes: notesReducer,
  meals: mealsReducer,
  products: productsReducer,
  categories: categoriesReducer,
  modal: modalReducer,
});

export default rootReducer;
