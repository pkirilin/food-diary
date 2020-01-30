import { combineReducers } from 'redux';
import notesListReducer from './notes-list-reducer';

const notesReducer = combineReducers({
  list: notesListReducer,
});

export default notesReducer;
