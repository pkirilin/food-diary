import { PagesOperationsState } from '../../store';
import { PagesOperationsActions, PagesOperationsActionTypes } from '../../action-types';

const initialState: PagesOperationsState = {};

const pagesOperationsReducer = (
  state: PagesOperationsState = initialState,
  action: PagesOperationsActions,
): PagesOperationsState => {
  switch (action.type) {
    case PagesOperationsActionTypes.CreateRequest:
      return { ...state, creating: true, created: false, createError: false };
    case PagesOperationsActionTypes.CreateSuccess:
      return { ...state, creating: false, created: true, createError: false };
    case PagesOperationsActionTypes.CreateError:
      return { ...state, creating: false, created: false, createError: true };
    default:
      return state;
  }
};

export default pagesOperationsReducer;
