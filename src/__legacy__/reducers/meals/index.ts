import { combineReducers } from 'redux';
import mealsListReducer from './meals-list-reducer';

const mealsReducer = combineReducers({
  list: mealsListReducer,
});

export default mealsReducer;
