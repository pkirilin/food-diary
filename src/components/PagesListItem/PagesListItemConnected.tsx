import { connect } from 'react-redux';
import PagesListItem from './PagesListItem';
import { Dispatch } from 'redux';
import { SetSelectedForPageAction } from '../../action-types';
import { setSelectedForPage } from '../../action-creators';
import { RootState } from '../../store';

type PagesListItemDispatchType = Dispatch<SetSelectedForPageAction>;

export interface PagesListItemStateToPropsMapResult {
  editablePagesIds: number[];
  selectedPagesIds: number[];
}

export interface PagesListItemDispatchToPropsMapResult {
  setSelectedForPage: (selected: boolean, pageId: number) => void;
}

const mapStateToProps = (state: RootState): PagesListItemStateToPropsMapResult => {
  return {
    editablePagesIds: state.pages.list.editablePagesIds,
    selectedPagesIds: state.pages.list.selectedPagesIds,
  };
};

const mapDispatchToProps = (dispatch: PagesListItemDispatchType): PagesListItemDispatchToPropsMapResult => {
  return {
    setSelectedForPage: (selected: boolean, pageId: number): void => {
      dispatch(setSelectedForPage(selected, pageId));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListItem);
