import { CategoriesOperationsState } from '../../store';
import { CategoriesOperationsActions, CategoriesOperationsActionTypes } from '../../action-types';

const initialState: CategoriesOperationsState = {
  status: {
    performing: false,
  },
};

const categoriesOperationsReducer = (
  state: CategoriesOperationsState = initialState,
  action: CategoriesOperationsActions,
): CategoriesOperationsState => {
  switch (action.type) {
    case CategoriesOperationsActionTypes.CreateRequest:
      return {
        ...state,
        status: {
          ...state.status,
          performing: true,
          message: action.operationMessage,
        },
      };
    case CategoriesOperationsActionTypes.CreateSuccess:
      return {
        ...state,
        status: {
          ...state.status,
          performing: false,
        },
      };
    case CategoriesOperationsActionTypes.CreateError:
      return {
        ...state,
        status: {
          ...state.status,
          performing: false,
          error: action.error,
        },
      };

    case CategoriesOperationsActionTypes.EditRequest:
      return {
        ...state,
        status: {
          ...state.status,
          performing: true,
          message: action.operationMessage,
        },
      };
    case CategoriesOperationsActionTypes.EditSuccess:
      return {
        ...state,
        status: {
          ...state.status,
          performing: false,
        },
      };
    case CategoriesOperationsActionTypes.EditError:
      return {
        ...state,
        status: {
          ...state.status,
          performing: false,
          error: action.error,
        },
      };

    case CategoriesOperationsActionTypes.DeleteRequest:
      return {
        ...state,
        status: {
          ...state.status,
          performing: true,
          message: action.operationMessage,
        },
      };
    case CategoriesOperationsActionTypes.DeleteSuccess:
      return {
        ...state,
        status: {
          ...state.status,
          performing: false,
        },
      };
    case CategoriesOperationsActionTypes.DeleteError:
      return {
        ...state,
        status: {
          ...state.status,
          performing: false,
          error: action.error,
        },
      };

    default:
      return state;
  }
};

export default categoriesOperationsReducer;
