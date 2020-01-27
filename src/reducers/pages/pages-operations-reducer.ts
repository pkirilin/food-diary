import { PagesOperationsState } from '../../store';
import { PagesOperationsActions, PagesOperationsActionTypes } from '../../action-types';

const initialState: PagesOperationsState = {
  status: {
    performing: false,
  },
};

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

    case PagesOperationsActionTypes.DeleteRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: 'Deleting pages',
        },
      };
    case PagesOperationsActionTypes.DeleteSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case PagesOperationsActionTypes.DeleteError:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    default:
      return state;
  }
};

export default pagesOperationsReducer;
