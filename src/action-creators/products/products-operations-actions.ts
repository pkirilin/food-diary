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
import { readBadRequestResponseAsync } from '../../utils/bad-request-response-reader';

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

      if (response.ok) {
        return dispatch(createProductSuccess());
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${ProductsOperationsBaseErrorMessages.Create}: ${badRequestResponse}`);
          return dispatch(createProductError(`${ProductsOperationsBaseErrorMessages.Create}: ${badRequestResponse}`));
        case 500:
          alert(`${ProductsOperationsBaseErrorMessages.Create}: server error`);
          return dispatch(createProductError(`${ProductsOperationsBaseErrorMessages.Create}: server error`));
        default:
          alert(`${ProductsOperationsBaseErrorMessages.Create}: unknown response code`);
          return dispatch(createProductError(`${ProductsOperationsBaseErrorMessages.Create}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(ProductsOperationsBaseErrorMessages.Create);
      return dispatch(createProductError(ProductsOperationsBaseErrorMessages.Create));
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

      if (response.ok) {
        return dispatch(editProductSuccess());
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${ProductsOperationsBaseErrorMessages.Edit}: ${badRequestResponse}`);
          return dispatch(editProductError(`${ProductsOperationsBaseErrorMessages.Edit}: ${badRequestResponse}`));
        case 500:
          alert(`${ProductsOperationsBaseErrorMessages.Edit}: server error`);
          return dispatch(editProductError(`${ProductsOperationsBaseErrorMessages.Edit}: server error`));
        default:
          alert(`${ProductsOperationsBaseErrorMessages.Edit}: unknown response code`);
          return dispatch(editProductError(`${ProductsOperationsBaseErrorMessages.Edit}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(ProductsOperationsBaseErrorMessages.Edit);
      return dispatch(editProductError(ProductsOperationsBaseErrorMessages.Edit));
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

      if (response.ok) {
        return dispatch(deleteProductSuccess());
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${ProductsOperationsBaseErrorMessages.Delete}: ${badRequestResponse}`);
          return dispatch(deleteProductError(`${ProductsOperationsBaseErrorMessages.Delete}: ${badRequestResponse}`));
        case 500:
          alert(`${ProductsOperationsBaseErrorMessages.Delete}: server error`);
          return dispatch(deleteProductError(`${ProductsOperationsBaseErrorMessages.Delete}: server error`));
        default:
          alert(`${ProductsOperationsBaseErrorMessages.Delete}: unknown response code`);
          return dispatch(deleteProductError(`${ProductsOperationsBaseErrorMessages.Delete}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(ProductsOperationsBaseErrorMessages.Delete);
      return dispatch(deleteProductError(ProductsOperationsBaseErrorMessages.Delete));
    }
  };
};
