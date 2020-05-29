import { Dispatch } from 'redux';
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
  CreateProductActionCreator,
  CreateProductActions,
  EditProductActionCreator,
  EditProductActions,
  DeleteProductActionCreator,
  DeleteProductActions,
  OpenModalAction,
} from '../../action-types';
import { ProductEditRequest, ProductCreateEdit, ErrorReason } from '../../models';
import { createProductAsync, editProductAsync, deleteProductAsync } from '../../services';
import { readBadRequestResponseAsync } from '../../utils/bad-request-response-reader';
import { openMessageModal } from '../modal-actions';

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

enum ProductsOperationsBaseErrorMessages {
  Create = 'Failed to create product',
  Edit = 'Failed to update product',
  Delete = 'Failed to delete product',
}

export const createProduct: CreateProductActionCreator = (product: ProductCreateEdit) => {
  return async (
    dispatch: Dispatch<CreateProductActions | OpenModalAction>,
  ): Promise<CreateProductSuccessAction | CreateProductErrorAction> => {
    dispatch(createProductRequest(product, 'Creating product'));
    try {
      const response = await createProductAsync(product);

      if (response.ok) {
        return dispatch(createProductSuccess());
      }

      let errorMessage = `${ProductsOperationsBaseErrorMessages.Create}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(createProductError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', ProductsOperationsBaseErrorMessages.Create));
      return dispatch(createProductError(ProductsOperationsBaseErrorMessages.Create));
    }
  };
};

export const editProduct: EditProductActionCreator = (request: ProductEditRequest) => {
  return async (
    dispatch: Dispatch<EditProductActions | OpenModalAction>,
  ): Promise<EditProductSuccessAction | EditProductErrorAction> => {
    dispatch(editProductRequest(request, 'Updating product'));
    try {
      const response = await editProductAsync(request);

      if (response.ok) {
        return dispatch(editProductSuccess());
      }

      let errorMessage = `${ProductsOperationsBaseErrorMessages.Edit}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(editProductError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', ProductsOperationsBaseErrorMessages.Edit));
      return dispatch(editProductError(ProductsOperationsBaseErrorMessages.Edit));
    }
  };
};

export const deleteProduct: DeleteProductActionCreator = (productId: number) => {
  return async (
    dispatch: Dispatch<DeleteProductActions | OpenModalAction>,
  ): Promise<DeleteProductSuccessAction | DeleteProductErrorAction> => {
    dispatch(deleteProductRequest(productId, 'Deleting product'));
    try {
      const response = await deleteProductAsync(productId);

      if (response.ok) {
        return dispatch(deleteProductSuccess());
      }

      let errorMessage = `${ProductsOperationsBaseErrorMessages.Delete}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(deleteProductError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', ProductsOperationsBaseErrorMessages.Delete));
      return dispatch(deleteProductError(ProductsOperationsBaseErrorMessages.Delete));
    }
  };
};
