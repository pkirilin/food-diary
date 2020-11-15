import { PagesOperationsState } from '../../store';
import { PagesOperationsActions, PagesOperationsActionTypes } from '../../action-types';

export const initialState: PagesOperationsState = {
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
          message: action.requestMessage,
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
          error: action.errorMessage,
        },
      };

    case PagesOperationsActionTypes.EditRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: action.requestMessage,
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
          error: action.errorMessage,
        },
      };

    case PagesOperationsActionTypes.DeleteRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: action.requestMessage,
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
          error: action.errorMessage,
        },
      };

    case PagesOperationsActionTypes.ExportRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: action.requestMessage,
        },
      };
    case PagesOperationsActionTypes.ExportSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case PagesOperationsActionTypes.ExportError:
      return {
        ...state,
        status: {
          performing: false,
          error: action.errorMessage,
        },
      };

    case PagesOperationsActionTypes.ImportRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: action.requestMessage,
        },
      };
    case PagesOperationsActionTypes.ImportSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case PagesOperationsActionTypes.ImportError:
      return {
        ...state,
        status: {
          performing: false,
          error: action.errorMessage,
        },
      };

    case PagesOperationsActionTypes.DateForNewPageRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: action.requestMessage,
        },
      };
    case PagesOperationsActionTypes.DateForNewPageSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case PagesOperationsActionTypes.DateForNewPageError:
      return {
        ...state,
        status: {
          performing: false,
          error: action.errorMessage,
        },
      };
    default:
      return state;
  }
};

export default pagesOperationsReducer;
