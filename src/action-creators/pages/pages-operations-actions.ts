import { PageCreateEdit } from '../../models';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  CreatePageSuccessAction,
  CreatePageErrorAction,
  CreatePageRequestAction,
  PagesOperationsActionTypes,
} from '../../action-types';
import { createPage } from '../../services';

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

export const createPageActionCreator: ActionCreator<ThunkAction<
  Promise<CreatePageSuccessAction | CreatePageErrorAction>,
  void,
  PageCreateEdit,
  CreatePageSuccessAction | CreatePageErrorAction
>> = (page: PageCreateEdit) => {
  return async (dispatch: Dispatch): Promise<CreatePageSuccessAction | CreatePageErrorAction> => {
    dispatch(createPageRequest(page));

    try {
      const response = await createPage();
      if (!response.ok) {
        return dispatch(createPageError());
      }
      return dispatch(createPageSuccess());
    } catch (error) {
      return dispatch(createPageError());
    }
  };
};
