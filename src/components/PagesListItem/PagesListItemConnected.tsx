import { connect } from 'react-redux';
import PagesListItem from './PagesListItem';
import { Dispatch } from 'redux';
import { SetSelectedForPageAction } from '../../action-types';
import { setSelectedForPage } from '../../action-creators';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  editablePagesIds: number[];
  selectedPagesIds: number[];
}

export interface DispatchToPropsMapResult {
  setSelectedForPage: (selected: boolean, pageId: number) => void;
}

type PagesListItemDispatchType = Dispatch<SetSelectedForPageAction>;

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    editablePagesIds: state.pages.list.editablePagesIds,
    selectedPagesIds: state.pages.list.selectedPagesIds,
  };
};

const mapDispatchToProps = (dispatch: PagesListItemDispatchType): DispatchToPropsMapResult => {
  return {
    setSelectedForPage: (selected: boolean, pageId: number): void => {
      dispatch(setSelectedForPage(selected, pageId));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListItem);
