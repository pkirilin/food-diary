import { connect } from 'react-redux';
import PagesListControlsBottom from './PagesListControlsBottom';
import { AnyAction } from 'redux';
import { GetPagesListSuccessAction, GetPagesListErrorAction, UpdatePagesFilterAction } from '../../action-types';
import { updateFilterActionCreator, getPagesActionCreator } from '../../action-creators';
import { FoodDiaryState } from '../../store';
import { PageFilter, PageItem, invertSortOrder } from '../../models';
import { ThunkDispatch } from 'redux-thunk';

export interface StateToPropsMapResult {
  pageFilter: PageFilter;
}
export interface DispatchToPropsMapResult {
  toggleSortOrder: (filter: PageFilter) => Promise<UpdatePagesFilterAction>;
  getPages: () => Promise<GetPagesListSuccessAction | GetPagesListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pageFilter: state.pages.filter,
  };
};

type PagesListControlsBottomDispatch = ThunkDispatch<PageFilter, null, AnyAction> &
  ThunkDispatch<PageItem[], null, AnyAction>;

const mapDispatchToProps = (dispatch: PagesListControlsBottomDispatch): DispatchToPropsMapResult => {
  return {
    toggleSortOrder: (filter: PageFilter): Promise<UpdatePagesFilterAction> => {
      return dispatch(updateFilterActionCreator({ ...filter, sortOrder: invertSortOrder(filter.sortOrder) }));
    },
    getPages: (): Promise<GetPagesListSuccessAction | GetPagesListErrorAction> => {
      return dispatch(getPagesActionCreator());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsBottom);
