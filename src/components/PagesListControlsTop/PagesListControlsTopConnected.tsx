import { connect } from 'react-redux';
import PagesListControlsTop from './PagesListControlsTop';
import { Dispatch } from 'redux';
import { PagesListActions } from '../../action-types';
import { PageItemState } from '../../store';
import { createDraftPageActionCreator } from '../../action-creators';

export interface DispatchToPropsMapResult {
  createDraftPage: (draftPage: PageItemState) => void;
}

const mapStateToProps = null;

const mapDispatchToProps = (dispatch: Dispatch<PagesListActions>): DispatchToPropsMapResult => {
  return {
    createDraftPage: (draftPage: PageItemState): void => {
      dispatch(createDraftPageActionCreator(draftPage));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListControlsTop);
