import { combineReducers } from 'redux';
import notesListReducer from './notes-list-reducer';
import notesOperationsReducer from './notes-operations-reducer';

const notesReducer = combineReducers({
  list: notesListReducer,
  operations: notesOperationsReducer,
});

export default notesReducer;
