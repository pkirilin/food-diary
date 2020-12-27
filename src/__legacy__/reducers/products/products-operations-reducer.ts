import { ProductsOperationsState } from '../../store';
import { ProductsOperationsActions, ProductsOperationsActionTypes } from '../../action-types';

export const initialState: ProductsOperationsState = {
  productOperationStatus: {
    performing: false,
  },
};

const productsOperationsReducer = (
  state: ProductsOperationsState = initialState,
  action: ProductsOperationsActions,
): ProductsOperationsState => {
  switch (action.type) {
    case ProductsOperationsActionTypes.CreateRequest:
      return {
        ...state,
        productOperationStatus: {
          performing: true,
          message: action.requestMessage,
        },
      };
    case ProductsOperationsActionTypes.CreateSuccess:
      return {
        ...state,
        productOperationStatus: {
          performing: false,
        },
      };
    case ProductsOperationsActionTypes.CreateError:
      return {
        ...state,
        productOperationStatus: {
          performing: false,
          error: action.errorMessage,
        },
      };

    case ProductsOperationsActionTypes.EditRequest:
      return {
        ...state,
        productOperationStatus: {
          performing: true,
          message: action.requestMessage,
        },
      };
    case ProductsOperationsActionTypes.EditSuccess:
      return {
        ...state,
        productOperationStatus: {
          performing: false,
        },
      };
    case ProductsOperationsActionTypes.EditError:
      return {
        ...state,
        productOperationStatus: {
          performing: false,
          error: action.errorMessage,
        },
      };

    case ProductsOperationsActionTypes.DeleteRequest:
      return {
        ...state,
        productOperationStatus: {
          performing: true,
          message: action.requestMessage,
        },
      };
    case ProductsOperationsActionTypes.DeleteSuccess:
      return {
        ...state,
        productOperationStatus: {
          performing: false,
        },
      };
    case ProductsOperationsActionTypes.DeleteError:
      return {
        ...state,
        productOperationStatus: {
          performing: false,
          error: action.errorMessage,
        },
      };
    default:
      return state;
  }
};

export default productsOperationsReducer;
