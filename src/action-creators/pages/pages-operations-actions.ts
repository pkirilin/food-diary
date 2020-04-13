import { PageCreateEdit, PageEditRequest } from '../../models';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  PagesOperationsActionTypes,
  CreatePageSuccessAction,
  CreatePageErrorAction,
  CreatePageRequestAction,
  EditPageSuccessAction,
  EditPageErrorAction,
  EditPageRequestAction,
  DeletePagesSuccessAction,
  DeletePagesErrorAction,
  DeletePagesRequestAction,
} from '../../action-types';
import { createPageAsync, deletePagesAsync, editPageAsync } from '../../services';

const createPageRequest = (page: PageCreateEdit, operationMessage: string): CreatePageRequestAction => {
  return {
    type: PagesOperationsActionTypes.CreateRequest,
    page,
    operationMessage,
  };
};

const createPageSuccess = (): CreatePageSuccessAction => {
  return {
    type: PagesOperationsActionTypes.CreateSuccess,
  };
};

const createPageError = (error: string): CreatePageErrorAction => {
  return {
    type: PagesOperationsActionTypes.CreateError,
    error,
  };
};

const editPageRequest = (request: PageEditRequest, operationMessage: string): EditPageRequestAction => {
  return {
    type: PagesOperationsActionTypes.EditRequest,
    request,
    operationMessage,
  };
};

const editPageSuccess = (): EditPageSuccessAction => {
  return {
    type: PagesOperationsActionTypes.EditSuccess,
  };
};

const editPageError = (error: string): EditPageErrorAction => {
  return {
    type: PagesOperationsActionTypes.EditError,
    error,
  };
};

const deletePagesRequest = (operationMessage: string): DeletePagesRequestAction => {
  return {
    type: PagesOperationsActionTypes.DeleteRequest,
    operationMessage,
  };
};

const deletePagesSuccess = (): DeletePagesSuccessAction => {
  return {
    type: PagesOperationsActionTypes.DeleteSuccess,
  };
};

const deletePagesError = (error: string): DeletePagesErrorAction => {
  return {
    type: PagesOperationsActionTypes.DeleteError,
    error,
  };
};

export const createPage: ActionCreator<ThunkAction<
  Promise<CreatePageSuccessAction | CreatePageErrorAction>,
  void,
  PageCreateEdit,
  CreatePageSuccessAction | CreatePageErrorAction
>> = (page: PageCreateEdit) => {
  return async (dispatch: Dispatch): Promise<CreatePageSuccessAction | CreatePageErrorAction> => {
    dispatch(createPageRequest(page, 'Creating page'));

    try {
      const response = await createPageAsync(page);
      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to create page (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(createPageError(errorMessageForInvalidData));
      }
      return dispatch(createPageSuccess());
    } catch (error) {
      const errorMessageForServerError = 'Failed to create page (server error)';
      alert(errorMessageForServerError);
      return dispatch(createPageError(errorMessageForServerError));
    }
  };
};

export const editPage: ActionCreator<ThunkAction<
  Promise<EditPageSuccessAction | EditPageErrorAction>,
  void,
  PageEditRequest,
  EditPageSuccessAction | EditPageErrorAction
>> = (request: PageEditRequest) => {
  return async (dispatch: Dispatch): Promise<EditPageSuccessAction | EditPageErrorAction> => {
    dispatch(editPageRequest(request, 'Updating page'));
    try {
      const response = await editPageAsync(request);
      if (!response.ok) {
        const errorMessageForInvalidData = 'Failed to update page (invalid data)';
        alert(errorMessageForInvalidData);
        return dispatch(editPageError(errorMessageForInvalidData));
      }
      return dispatch(editPageSuccess());
    } catch (error) {
      const errorMessageForServerError = 'Failed to update page (server error)';
      alert(errorMessageForServerError);
      return dispatch(editPageError(errorMessageForServerError));
    }
  };
};

export const deletePages: ActionCreator<ThunkAction<
  Promise<DeletePagesSuccessAction | DeletePagesErrorAction>,
  void,
  number[],
  DeletePagesSuccessAction | DeletePagesErrorAction
>> = (pagesIds: number[]) => {
  return async (dispatch: Dispatch): Promise<DeletePagesSuccessAction | DeletePagesErrorAction> => {
    const messageSuffixForPage = pagesIds.length > 1 ? 'pages' : 'page';
    dispatch(deletePagesRequest(`Deleting ${messageSuffixForPage}`));
    try {
      const response = await deletePagesAsync(pagesIds);
      if (!response.ok) {
        const errorMessageForInvalidData = `Failed to delete selected ${messageSuffixForPage} (invalid data)`;
        alert(errorMessageForInvalidData);
        return dispatch(deletePagesError(errorMessageForInvalidData));
      }
      return dispatch(deletePagesSuccess());
    } catch (error) {
      const errorMessageForServerError = `Failed to delete selected ${messageSuffixForPage} (server error)`;
      alert(errorMessageForServerError);
      return dispatch(deletePagesError(errorMessageForServerError));
    }
  };
};
