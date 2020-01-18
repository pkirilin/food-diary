import { UpdatePagesFilterAction, PagesFilterActionType } from '../../action-types';
import { PagesFilter } from '../../models';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

export const updateFilterActionCreator: ActionCreator<ThunkAction<
  Promise<UpdatePagesFilterAction>,
  PagesFilter,
  null,
  UpdatePagesFilterAction
>> = (updatedFilter: PagesFilter) => {
  return async (dispatch: Dispatch): Promise<UpdatePagesFilterAction> => {
    return dispatch({
      type: PagesFilterActionType.UpdateFilter,
      updatedFilter,
    });
  };
};
