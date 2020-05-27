import React from 'react';
import { connect } from 'react-redux';
import { closeModal } from '../../action-creators';
import { Dispatch } from 'redux';
import { CloseModalAction } from '../../action-types';
import { ModalButtons } from '../ModalBlocks';
import { Button } from '../Controls';
import { MessageModalBodyProps } from './MessageModalBody';

interface ConfirmationDialogBodyProps extends MessageModalBodyProps, ConfirmationDialogBodyDispatchToPropsMapResult {
  confirm: () => void;
}

interface ConfirmationDialogBodyDispatchToPropsMapResult {
  closeModal: () => void;
}

const ConfirmationModalBody: React.FC<ConfirmationDialogBodyProps> = ({
  message,
  confirm,
  closeModal,
}: ConfirmationDialogBodyProps) => {
  return (
    <React.Fragment>
      <p>{message}</p>
      <ModalButtons>
        <Button
          onClick={(): void => {
            closeModal();
            confirm();
          }}
        >
          Yes
        </Button>
        <Button
          onClick={(): void => {
            closeModal();
          }}
        >
          No
        </Button>
      </ModalButtons>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<CloseModalAction>): ConfirmationDialogBodyDispatchToPropsMapResult => {
  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },
  };
};

export default connect(null, mapDispatchToProps)(ConfirmationModalBody);
