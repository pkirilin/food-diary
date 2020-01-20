import { connect } from 'react-redux';
import PagesListItem from './PagesListItem';
import { Dispatch } from 'redux';
import { DeleteDraftPageAction } from '../../action-types';
import { deleteDraftPageActionCreator } from '../../action-creators';

export interface DispatchToPropsMapResult {
  deleteDraftPage: (draftPageId: number) => void;
}

const mapStateToProps = null;

const mapDispatchToProps = (dispatch: Dispatch<DeleteDraftPageAction>): DispatchToPropsMapResult => {
  return {
    deleteDraftPage: (draftPageId: number): void => {
      dispatch(deleteDraftPageActionCreator(draftPageId));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesListItem);
