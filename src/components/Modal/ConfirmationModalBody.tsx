import React from 'react';
import { connect } from 'react-redux';
import { closeModal } from '../../action-creators';
import { Dispatch } from 'redux';
import { CloseModalAction } from '../../action-types';
import { MessageModalBodyProps } from './MessageModalBody';
import { Button, Container } from '../__ui__';

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
    <Container direction="column" spaceBetweenChildren="large">
      <p>{message}</p>
      <Container justify="flex-end" spaceBetweenChildren="medium">
        <Container col="4">
          <Button
            onClick={(): void => {
              closeModal();
              confirm();
            }}
          >
            Yes
          </Button>
        </Container>
        <Container col="4">
          <Button
            onClick={(): void => {
              closeModal();
            }}
          >
            No
          </Button>
        </Container>
      </Container>
    </Container>
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
