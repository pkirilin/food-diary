import {
  CreateProductRequestAction,
  ProductsOperationsActionTypes,
  CreateProductSuccessAction,
  CreateProductErrorAction,
  EditProductRequestAction,
  EditProductSuccessAction,
  EditProductErrorAction,
  DeleteProductRequestAction,
  DeleteProductSuccessAction,
  DeleteProductErrorAction,
} from '../../action-types';
import { ProductEditRequest, ProductCreateEdit } from '../../models';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { createProductAsync, editProductAsync, deleteProductAsync } from '../../services';

const createProductRequest = (product: ProductCreateEdit, operationMessage: string): CreateProductRequestAction => {
  return {
    type: ProductsOperationsActionTypes.CreateRequest,
    product,
    operationMessage,
  };
};

const createProductSuccess = (): CreateProductSuccessAction => {
  return {
    type: ProductsOperationsActionTypes.CreateSuccess,
  };
};

const createProductError = (error: string): CreateProductErrorAction => {
  return {
    type: ProductsOperationsActionTypes.CreateError,
    error,
  };
};

const editProductRequest = (request: ProductEditRequest, operationMessage: string): EditProductRequestAction => {
  return {
    type: ProductsOperationsActionTypes.EditRequest,
    request,
    operationMessage,
  };
};

const editProductSuccess = (): EditProductSuccessAction => {
  return {
    type: ProductsOperationsActionTypes.EditSuccess,
  };
};

const editProductError = (error: string): EditProductErrorAction => {
  return {
    type: ProductsOperationsActionTypes.EditError,
    error,
  };
};

const deleteProductRequest = (productId: number, operationMessage: string): DeleteProductRequestAction => {
  return {
    type: ProductsOperationsActionTypes.DeleteRequest,
    productId,
    operationMessage,
  };
};

const deleteProductSuccess = (): DeleteProductSuccessAction => {
  return {
    type: ProductsOperationsActionTypes.DeleteSuccess,
  };
};

const deleteProductError = (error: string): DeleteProductErrorAction => {
  return {
    type: ProductsOperationsActionTypes.DeleteError,
    error,
  };
};

export const createProduct: ActionCreator<ThunkAction<
  Promise<CreateProductSuccessAction | CreateProductErrorAction>,
  void,
  ProductCreateEdit,
  CreateProductSuccessAction | CreateProductErrorAction
>> = (product: ProductCreateEdit) => {
  return async (dispatch: Dispatch): Promise<CreateProductSuccessAction | CreateProductErrorAction> => {
    dispatch(createProductRequest(product, 'Creating product'));
    try {
      const response = await createProductAsync(product);
      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to create product (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(createProductError(errorMessageForInvalidData));
      }
      return dispatch(createProductSuccess());
    } catch (error) {
      const errorMessageForServerError = 'Failed to create product (server error)';
      alert(errorMessageForServerError);
      return dispatch(createProductError(errorMessageForServerError));
    }
  };
};

export const editProduct: ActionCreator<ThunkAction<
  Promise<EditProductSuccessAction | EditProductErrorAction>,
  void,
  ProductEditRequest,
  EditProductSuccessAction | EditProductErrorAction
>> = (request: ProductEditRequest) => {
  return async (dispatch: Dispatch): Promise<EditProductSuccessAction | EditProductErrorAction> => {
    dispatch(editProductRequest(request, 'Updating product'));
    try {
      const response = await editProductAsync(request);
      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to update product (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(editProductError(errorMessageForInvalidData));
      }
      return dispatch(editProductSuccess());
    } catch (error) {
      const errorMessageForServerError = 'Failed to update product (server error)';
      alert(errorMessageForServerError);
      return dispatch(editProductError(errorMessageForServerError));
    }
  };
};

export const deleteProduct: ActionCreator<ThunkAction<
  Promise<DeleteProductSuccessAction | DeleteProductErrorAction>,
  void,
  number,
  DeleteProductSuccessAction | DeleteProductErrorAction
>> = (productId: number) => {
  return async (dispatch: Dispatch): Promise<DeleteProductSuccessAction | DeleteProductErrorAction> => {
    dispatch(deleteProductRequest(productId, 'Deleting product'));
    try {
      const response = await deleteProductAsync(productId);
      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to delete product (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(deleteProductError(errorMessageForInvalidData));
      }
      return dispatch(deleteProductSuccess());
    } catch (error) {
      const errorMessageForServerError = 'Failed to delete product (server error)';
      alert(errorMessageForServerError);
      return dispatch(deleteProductError(errorMessageForServerError));
    }
  };
};
