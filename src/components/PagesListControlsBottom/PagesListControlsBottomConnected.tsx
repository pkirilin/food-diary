import { connect } from 'react-redux';
import PagesListControlsBottom from './PagesListControlsBottom';
import { Dispatch } from 'redux';
import { updateFilter } from '../../action-creators';
import { FoodDiaryState } from '../../store';
import { PagesFilter } from '../../models';
import { UpdatePagesFilterAction } from '../../action-types';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
  pagesLoaded: boolean;
}
export interface DispatchToPropsMapResult {
  updatePagesFilter: (updatedFilter: PagesFilter) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
    pagesLoaded: state.pages.list.pageItemsFetchState.loaded,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<UpdatePagesFilterAction>): DispatchToPropsMapResult => {
  return {
    updatePagesFilter: (updatedFilter: PagesFilter): void => {
      dispatch(updateFilter(updatedFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsBottom);
