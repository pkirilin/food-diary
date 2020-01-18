import { connect } from 'react-redux';
import PagesListControlsBottom from './PagesListControlsBottom';
import { AnyAction, Dispatch } from 'redux';
import { updateFilterActionCreator } from '../../action-creators';
import { FoodDiaryState } from '../../store';
import { PagesFilter, invertSortOrder } from '../../models';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
}
export interface DispatchToPropsMapResult {
  toggleSortOrder: (filter: PagesFilter) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): DispatchToPropsMapResult => {
  return {
    toggleSortOrder: (filter: PagesFilter): void => {
      dispatch(updateFilterActionCreator({ ...filter, sortOrder: invertSortOrder(filter.sortOrder) }));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsBottom);
