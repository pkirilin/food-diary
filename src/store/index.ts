import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';

const initialState = {};

const store = createStore(rootReducer, initialState, applyMiddleware(thunkMiddleware, createLogger()));

export default store;

export * from './state';
export * from './data-fetch-state';
export * from './data-operation-state';

export * from './pages-state';
export * from './notes-state';
export * from './meals-state';
export * from './products-state';
