import { connect } from 'react-redux';
import Modal from './Modal';
import { RootState, ModalBody, ModalOptions } from '../../store';
import { Dispatch } from 'redux';
import { CloseModalAction } from '../../action-types';
import { closeModal } from '../../action-creators';

export interface ModalStateToPropsMapResult {
  title: string;
  body: ModalBody;
  isOpened: boolean;
  options: ModalOptions;
}

export interface ModalDispatchToPropsMapResult {
  closeModal: () => void;
}

const mapStateToProps = (state: RootState): ModalStateToPropsMapResult => {
  return {
    title: state.modal.title,
    body: state.modal.body,
    isOpened: state.modal.isOpened,
    options: state.modal.options,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<CloseModalAction>): ModalDispatchToPropsMapResult => {
  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
