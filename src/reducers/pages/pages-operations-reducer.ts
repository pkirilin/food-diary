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
      return {
        ...state,
        status: {
          performing: true,
          message: 'Creating page',
        },
      };
    case PagesOperationsActionTypes.CreateSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case PagesOperationsActionTypes.CreateError:
      return {
        ...state,
        status: {
          performing: false,
        },
      };

    case PagesOperationsActionTypes.EditRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: 'Updating page',
        },
      };
    case PagesOperationsActionTypes.EditSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case PagesOperationsActionTypes.EditError:
      return {
        ...state,
        status: {
          performing: false,
        },
      };

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
