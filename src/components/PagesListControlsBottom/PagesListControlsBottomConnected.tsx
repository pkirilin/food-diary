import { connect } from 'react-redux';
import PagesListControlsBottom from './PagesListControlsBottom';
import { AnyAction } from 'redux';
import { GetPagesListSuccessAction, GetPagesListErrorAction, UpdatePagesFilterAction } from '../../action-types';
import { updateFilterActionCreator, getPagesActionCreator } from '../../action-creators';
import { FoodDiaryState } from '../../store';
import { PagesFilter, PageItem, invertSortOrder } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  pageFilter: PagesFilter;
}
export interface DispatchToPropsMapResult {
  toggleSortOrder: (filter: PagesFilter) => Promise<UpdatePagesFilterAction>;
  getPages: () => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pageFilter: state.pages.filter,
  };
};

type PagesListControlsBottomDispatch = ThunkDispatch<PagesFilter, null, AnyAction> &
  ThunkDispatch<PageItem[], null, AnyAction>;

const mapDispatchToProps = (dispatch: PagesListControlsBottomDispatch): DispatchToPropsMapResult => {
  return {
    toggleSortOrder: (filter: PagesFilter): Promise<UpdatePagesFilterAction> => {
      return dispatch(updateFilterActionCreator({ ...filter, sortOrder: invertSortOrder(filter.sortOrder) }));
    },
    getPages: (): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPagesActionCreator());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsBottom);
