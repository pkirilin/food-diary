import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { CloseModalAction } from '../../action-types';
import { closeModal } from '../../action-creators';
import ModalBodyConfirmation from './ModalBodyConfirmation';

export interface ModalBodyConfirmationDispatchToPropsMapResult {
  closeModal: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<CloseModalAction>): ModalBodyConfirmationDispatchToPropsMapResult => {
  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },
  };
};

export default connect(null, mapDispatchToProps)(ModalBodyConfirmation);
