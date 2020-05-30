import { Dispatch } from 'redux';
import {
  CreateCategorySuccessAction,
  CreateCategoryErrorAction,
  CreateCategoryRequestAction,
  CategoriesOperationsActionTypes,
  EditCategorySuccessAction,
  EditCategoryErrorAction,
  EditCategoryRequestAction,
  DeleteCategoryRequestAction,
  DeleteCategorySuccessAction,
  DeleteCategoryErrorAction,
  CreateCategoryActionCreator,
  CreateCategoryActions,
  EditCategoryActionCreator,
  EditCategoryActions,
  DeleteCategoryActionCreator,
  DeleteCategoryActions,
  OpenModalAction,
} from '../../action-types';
import { CategoryCreateEdit, CategoryEditRequest, ErrorReason } from '../../models';
import { createCategoryAsync, editCategoryAsync, deleteCategoryAsync } from '../../services';
import { readBadRequestResponseAsync } from '../../utils';
import { openMessageModal } from '../modal-actions';

const createCategoryRequest = (category: CategoryCreateEdit, operationMessage: string): CreateCategoryRequestAction => {
  return {
    type: CategoriesOperationsActionTypes.CreateRequest,
    category,
    operationMessage,
  };
};

const createCategorySuccess = (createdCategoryId: number): CreateCategorySuccessAction => {
  return {
    type: CategoriesOperationsActionTypes.CreateSuccess,
    createdCategoryId,
  };
};

const createCategoryError = (error: string): CreateCategoryErrorAction => {
  return {
    type: CategoriesOperationsActionTypes.CreateError,
    error,
  };
};

const editCategoryRequest = (request: CategoryEditRequest, operationMessage: string): EditCategoryRequestAction => {
  return {
    type: CategoriesOperationsActionTypes.EditRequest,
    request,
    operationMessage,
  };
};

const editCategorySuccess = (): EditCategorySuccessAction => {
  return {
    type: CategoriesOperationsActionTypes.EditSuccess,
  };
};

const editCategoryError = (error: string): EditCategoryErrorAction => {
  return {
    type: CategoriesOperationsActionTypes.EditError,
    error,
  };
};

const deleteCategoryRequest = (operationMessage: string): DeleteCategoryRequestAction => {
  return {
    type: CategoriesOperationsActionTypes.DeleteRequest,
    operationMessage,
  };
};

const deleteCategorySuccess = (): DeleteCategorySuccessAction => {
  return {
    type: CategoriesOperationsActionTypes.DeleteSuccess,
  };
};

const deleteCategoryError = (error: string): DeleteCategoryErrorAction => {
  return {
    type: CategoriesOperationsActionTypes.DeleteError,
    error,
  };
};

enum CategoriesOperationsErrorMessages {
  Create = 'Failed to create category',
  Edit = 'Failed to update category',
  Delete = 'Failed to delete category',
}

export const createCategory: CreateCategoryActionCreator = (category: CategoryCreateEdit) => {
  return async (
    dispatch: Dispatch<CreateCategoryActions | OpenModalAction>,
  ): Promise<CreateCategorySuccessAction | CreateCategoryErrorAction> => {
    dispatch(createCategoryRequest(category, 'Creating category'));
    try {
      const response = await createCategoryAsync(category);

      if (response.ok) {
        const createdCategoryIdStr = await response.text();
        return dispatch(createCategorySuccess(+createdCategoryIdStr));
      }

      let errorMessage = `${CategoriesOperationsErrorMessages.Create}`;

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
      return dispatch(createCategoryError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', CategoriesOperationsErrorMessages.Create));
      return dispatch(createCategoryError(CategoriesOperationsErrorMessages.Create));
    }
  };
};

export const editCategory: EditCategoryActionCreator = (request: CategoryEditRequest) => {
  return async (
    dispatch: Dispatch<EditCategoryActions | OpenModalAction>,
  ): Promise<EditCategorySuccessAction | EditCategoryErrorAction> => {
    dispatch(editCategoryRequest(request, 'Updating category'));
    try {
      const response = await editCategoryAsync(request);

      if (response.ok) {
        return dispatch(editCategorySuccess());
      }

      let errorMessage = `${CategoriesOperationsErrorMessages.Edit}`;

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
      return dispatch(editCategoryError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', CategoriesOperationsErrorMessages.Edit));
      return dispatch(editCategoryError(CategoriesOperationsErrorMessages.Edit));
    }
  };
};

export const deleteCategory: DeleteCategoryActionCreator = (categoryId: number) => {
  return async (
    dispatch: Dispatch<DeleteCategoryActions | OpenModalAction>,
  ): Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction> => {
    dispatch(deleteCategoryRequest('Deleting category'));
    try {
      const response = await deleteCategoryAsync(categoryId);

      if (response.ok) {
        return dispatch(deleteCategorySuccess());
      }

      let errorMessage = `${CategoriesOperationsErrorMessages.Delete}`;

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
      return dispatch(deleteCategoryError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', CategoriesOperationsErrorMessages.Delete));
      return dispatch(deleteCategoryError(CategoriesOperationsErrorMessages.Delete));
    }
  };
};
