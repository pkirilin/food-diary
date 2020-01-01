import { Dispatch, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { PageItem } from '../../models';
import { GetPagesListSuccessAction, GetPagesListRequestAction, PagesListActionType } from '../../action-types';

const createRequestAction = (): GetPagesListRequestAction => {
  return {
    type: PagesListActionType.Request,
  };
};

const createSuccessAction = (pages: PageItem[]): GetPagesListSuccessAction => {
  return {
    type: PagesListActionType.Success,
    pages,
  };
};

export const getPagesActionCreator: ActionCreator<ThunkAction<
  Promise<GetPagesListSuccessAction>,
  PageItem[],
  null,
  GetPagesListSuccessAction
>> = () => {
  return async (dispatch: Dispatch): Promise<GetPagesListSuccessAction> => {
    dispatch(createRequestAction());
    const response = await fetch('pages-list-data.json');
    const pagesPromise: Promise<PageItem[]> = await response.json();
    const pages = await pagesPromise;
    return dispatch(createSuccessAction(pages));
  };
};
