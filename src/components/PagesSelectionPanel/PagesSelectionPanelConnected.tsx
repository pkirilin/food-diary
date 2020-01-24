import { connect } from 'react-redux';
import PagesSelectionPanel from './PagesSelectionPanel';
import { FoodDiaryState } from '../../store';
import { Dispatch } from 'redux';
import { SetSelectedForAllPagesAction } from '../../action-types';
import { setSelectedForAllPages } from '../../action-creators';

export interface StateToPropsMapResult {
  visiblePagesCount: number;
  selectedPagesCount: number;
}

export interface DispatchToPropsMapResult {
  setSelectedForAllPages: (selected: boolean) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    visiblePagesCount: state.pages.list.pageItems.data.length,
    selectedPagesCount: state.pages.list.selectedPagesIds.length,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<SetSelectedForAllPagesAction>): DispatchToPropsMapResult => {
  return {
    setSelectedForAllPages: (selected: boolean): void => {
      dispatch(setSelectedForAllPages(selected));
    },
  };
};

const PagesSelectionPanelConnected = connect(mapStateToProps, mapDispatchToProps)(PagesSelectionPanel);

export default PagesSelectionPanelConnected;
