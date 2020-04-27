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
import { readBadRequestResponseAsync } from '../../utils/bad-request-response-reader';

const createPageRequest = (page: PageCreateEdit, operationMessage: string): CreatePageRequestAction => {
  return {
    type: PagesOperationsActionTypes.CreateRequest,
    page,
    operationMessage,
  };
};

const createPageSuccess = (createdPageId: number): CreatePageSuccessAction => {
  return {
    type: PagesOperationsActionTypes.CreateSuccess,
    createdPageId,
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

enum PagesOperationsBaseErrorMessages {
  Create = 'Failed to create page',
  Edit = 'Failed to update page',
  Delete = 'Failed to delete selected',
}

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

      if (response.ok) {
        const createdPageIdStr = await response.text();
        return dispatch(createPageSuccess(+createdPageIdStr));
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${PagesOperationsBaseErrorMessages.Create}: ${badRequestResponse}`);
          return dispatch(createPageError(`${PagesOperationsBaseErrorMessages.Create}: ${badRequestResponse}`));
        case 500:
          alert(`${PagesOperationsBaseErrorMessages.Create}: server error`);
          return dispatch(createPageError(`${PagesOperationsBaseErrorMessages.Create}: server error`));
        default:
          alert(`${PagesOperationsBaseErrorMessages.Create}: unknown response code`);
          return dispatch(createPageError(`${PagesOperationsBaseErrorMessages.Create}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(PagesOperationsBaseErrorMessages.Create);
      return dispatch(createPageError(PagesOperationsBaseErrorMessages.Create));
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

      if (response.ok) {
        return dispatch(editPageSuccess());
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${PagesOperationsBaseErrorMessages.Edit}: ${badRequestResponse}`);
          return dispatch(editPageError(`${PagesOperationsBaseErrorMessages.Edit}: ${badRequestResponse}`));
        case 500:
          alert(`${PagesOperationsBaseErrorMessages.Edit}: server error`);
          return dispatch(editPageError(`${PagesOperationsBaseErrorMessages.Edit}: server error`));
        default:
          alert(`${PagesOperationsBaseErrorMessages.Edit}: unknown response code`);
          return dispatch(editPageError(`${PagesOperationsBaseErrorMessages.Edit}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(PagesOperationsBaseErrorMessages.Edit);
      return dispatch(editPageError(PagesOperationsBaseErrorMessages.Edit));
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

      if (response.ok) {
        return dispatch(deletePagesSuccess());
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${PagesOperationsBaseErrorMessages.Delete}: ${badRequestResponse}`);
          return dispatch(
            deletePagesError(
              `${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: ${badRequestResponse}`,
            ),
          );
        case 500:
          alert(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: server error`);
          return dispatch(
            deletePagesError(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: server error`),
          );
        default:
          alert(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: unknown response code`);
          return dispatch(
            deletePagesError(
              `${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: unknown response code`,
            ),
          );
      }
    } catch (error) {
      console.error(error);
      alert(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}`);
      return dispatch(deletePagesError(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}`));
    }
  };
};
