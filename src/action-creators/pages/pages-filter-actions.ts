import { UpdatePagesFilterAction, PagesFilterActionType } from '../../action-types';
import { PageFilter } from '../../models';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

export const updateFilterActionCreator: ActionCreator<ThunkAction<
  Promise<UpdatePagesFilterAction>,
  PageFilter,
  null,
  UpdatePagesFilterAction
>> = (updatedFilter: PageFilter) => {
  return async (dispatch: Dispatch): Promise<UpdatePagesFilterAction> => {
    return dispatch({
      type: PagesFilterActionType.UpdateFilter,
      updatedFilter,
    });
  };
};
