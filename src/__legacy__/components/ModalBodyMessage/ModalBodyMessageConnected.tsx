import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { CloseModalAction } from '../../action-types';
import { closeModal } from '../../action-creators';
import ModalBodyMessage from './ModalBodyMessage';

export interface ModalBodyMessageDispatchToPropsMapResult {
  closeModal: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<CloseModalAction>): ModalBodyMessageDispatchToPropsMapResult => {
  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },
  };
};

const ModalBodyMessageConnected = connect(null, mapDispatchToProps)(ModalBodyMessage);

export default ModalBodyMessageConnected;
