import { connect } from 'react-redux';
import PagesListControlsBottom from './PagesListControlsBottom';
import { Dispatch } from 'redux';
import { updateFilterActionCreator } from '../../action-creators';
import { FoodDiaryState } from '../../store';
import { PagesFilter } from '../../models';
import { UpdatePagesFilterAction } from '../../action-types';

export interface StateToPropsMapResult {
  pagesFilter: PagesFilter;
}
export interface DispatchToPropsMapResult {
  updatePagesFilter: (updatedFilter: PagesFilter) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    pagesFilter: state.pages.filter,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<UpdatePagesFilterAction>): DispatchToPropsMapResult => {
  return {
    updatePagesFilter: (updatedFilter: PagesFilter): void => {
      dispatch(updateFilterActionCreator(updatedFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsBottom);
