import { PageCreateEdit } from '../../models';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  PagesOperationsActionTypes,
  CreatePageSuccessAction,
  CreatePageErrorAction,
  CreatePageRequestAction,
  DeletePagesSuccessAction,
  DeletePagesErrorAction,
  DeletePagesRequestAction,
} from '../../action-types';
import { createPageAsync, deletePagesAsync } from '../../services';

const createPageRequest = (page: PageCreateEdit): CreatePageRequestAction => {
  return {
    type: PagesOperationsActionTypes.CreateRequest,
    page,
  };
};

const createPageSuccess = (): CreatePageSuccessAction => {
  return {
    type: PagesOperationsActionTypes.CreateSuccess,
  };
};

const createPageError = (): CreatePageErrorAction => {
  return {
    type: PagesOperationsActionTypes.CreateError,
  };
};

const deletePagesRequest = (): DeletePagesRequestAction => {
  return {
    type: PagesOperationsActionTypes.DeleteRequest,
  };
};

const deletePagesSuccess = (): DeletePagesSuccessAction => {
  return {
    type: PagesOperationsActionTypes.DeleteSuccess,
  };
};

const deletePagesError = (): DeletePagesErrorAction => {
  return {
    type: PagesOperationsActionTypes.DeleteError,
  };
};

export const createPage: ActionCreator<ThunkAction<
  Promise<CreatePageSuccessAction | CreatePageErrorAction>,
  void,
  PageCreateEdit,
  CreatePageSuccessAction | CreatePageErrorAction
>> = (page: PageCreateEdit) => {
  return async (dispatch: Dispatch): Promise<CreatePageSuccessAction | CreatePageErrorAction> => {
    dispatch(createPageRequest(page));

    try {
      const response = await createPageAsync();
      if (!response.ok) {
        return dispatch(createPageError());
      }
      return dispatch(createPageSuccess());
    } catch (error) {
      return dispatch(createPageError());
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
    dispatch(deletePagesRequest());
    try {
      const response = await deletePagesAsync(pagesIds);
      if (!response.ok) {
        return dispatch(deletePagesError());
      }
      return dispatch(deletePagesSuccess());
    } catch (error) {
      return dispatch(deletePagesError());
    }
  };
};
