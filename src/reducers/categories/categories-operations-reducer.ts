import { CategoriesOperationsState } from '../../store';
import { CategoriesOperationsActions, CategoriesOperationsActionTypes } from '../../action-types';

export const initialState: CategoriesOperationsState = {
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
          performing: true,
          message: action.requestMessage,
        },
      };
    case CategoriesOperationsActionTypes.CreateSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case CategoriesOperationsActionTypes.CreateError:
      return {
        ...state,
        status: {
          performing: false,
          error: action.errorMessage,
        },
      };

    case CategoriesOperationsActionTypes.EditRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: action.requestMessage,
        },
      };
    case CategoriesOperationsActionTypes.EditSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case CategoriesOperationsActionTypes.EditError:
      return {
        ...state,
        status: {
          performing: false,
          error: action.errorMessage,
        },
      };

    case CategoriesOperationsActionTypes.DeleteRequest:
      return {
        ...state,
        status: {
          performing: true,
          message: action.requestMessage,
        },
      };
    case CategoriesOperationsActionTypes.DeleteSuccess:
      return {
        ...state,
        status: {
          performing: false,
        },
      };
    case CategoriesOperationsActionTypes.DeleteError:
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

export default categoriesOperationsReducer;
