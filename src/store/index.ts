import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';

const initialState = {};

const store = createStore(rootReducer, initialState, applyMiddleware(thunkMiddleware, createLogger()));

export default store;

export * from './common';
export * from './root-state';
export * from './pages-state';
export * from './notes-state';
export * from './meals-state';
export * from './products-state';
export * from './categories-state';
export * from './modal-state';
