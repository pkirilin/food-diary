import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
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
} from '../../action-types';
import { CategoryCreateEdit } from '../../models';
import { createCategoryAsync, editCategoryAsync, deleteCategoryAsync } from '../../services';

const createCategoryRequest = (category: CategoryCreateEdit, operationMessage: string): CreateCategoryRequestAction => {
  return {
    type: CategoriesOperationsActionTypes.CreateRequest,
    category,
    operationMessage,
  };
};

const createCategorySuccess = (): CreateCategorySuccessAction => {
  return {
    type: CategoriesOperationsActionTypes.CreateSuccess,
  };
};

const createCategoryError = (error: string): CreateCategoryErrorAction => {
  return {
    type: CategoriesOperationsActionTypes.CreateError,
    error,
  };
};

const editCategoryRequest = (category: CategoryCreateEdit, operationMessage: string): EditCategoryRequestAction => {
  return {
    type: CategoriesOperationsActionTypes.EditRequest,
    category,
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

export const createCategory: ActionCreator<ThunkAction<
  Promise<CreateCategorySuccessAction | CreateCategoryErrorAction>,
  void,
  CategoryCreateEdit,
  CreateCategorySuccessAction | CreateCategoryErrorAction
>> = (category: CategoryCreateEdit) => {
  return async (dispatch: Dispatch): Promise<CreateCategorySuccessAction | CreateCategoryErrorAction> => {
    dispatch(createCategoryRequest(category, 'Creating category'));

    try {
      const response = await createCategoryAsync(category);

      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to create category (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(createCategoryError(errorMessageForInvalidData));
      }

      return dispatch(createCategorySuccess());
    } catch (error) {
      const errorMessageForServerError = 'Failed to create category (server error)';
      alert(errorMessageForServerError);
      return dispatch(createCategoryError(errorMessageForServerError));
    }
  };
};

export const editCategory: ActionCreator<ThunkAction<
  Promise<EditCategorySuccessAction | EditCategoryErrorAction>,
  void,
  CategoryCreateEdit,
  EditCategorySuccessAction | EditCategoryErrorAction
>> = (category: CategoryCreateEdit) => {
  return async (dispatch: Dispatch): Promise<EditCategorySuccessAction | EditCategoryErrorAction> => {
    dispatch(editCategoryRequest(category, 'Updating category'));

    try {
      const response = await editCategoryAsync(category);

      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to update category (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(editCategoryError(errorMessageForInvalidData));
      }

      return dispatch(editCategorySuccess());
    } catch (error) {
      const errorMessageForServerError = 'Failed to update category (server error)';
      alert(errorMessageForServerError);
      return dispatch(editCategoryError(errorMessageForServerError));
    }
  };
};

export const deleteCategory: ActionCreator<ThunkAction<
  Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction>,
  void,
  number,
  DeleteCategorySuccessAction | DeleteCategoryErrorAction
>> = (categoryId: number) => {
  return async (dispatch: Dispatch): Promise<DeleteCategorySuccessAction | DeleteCategoryErrorAction> => {
    dispatch(deleteCategoryRequest('Deleting category'));

    try {
      const response = await deleteCategoryAsync(categoryId);

      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to delete category (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(deleteCategoryError(errorMessageForInvalidData));
      }

      return dispatch(deleteCategorySuccess());
    } catch (error) {
      const errorMessageForServerError = 'Failed to delete category (server error)';
      alert(errorMessageForServerError);
      return dispatch(deleteCategoryError(errorMessageForServerError));
    }
  };
};
