import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { CloseModalAction } from '../../action-types';
import { closeModal } from '../../action-creators';
import { Button } from '../Controls';
import { ModalButtons } from '../ModalBlocks';

export interface MessageModalBodyProps extends MessageBodyDispatchToPropsMapResult {
  message: string;
}

interface MessageBodyDispatchToPropsMapResult {
  closeModal: () => void;
}

const MessageModalBody: React.FC<MessageModalBodyProps> = ({ message, closeModal }: MessageModalBodyProps) => {
  return (
    <React.Fragment>
      <p>{message}</p>
      <ModalButtons>
        <Button
          onClick={(): void => {
            closeModal();
          }}
        >
          OK
        </Button>
      </ModalButtons>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<CloseModalAction>): MessageBodyDispatchToPropsMapResult => {
  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },
  };
};

export default connect(null, mapDispatchToProps)(MessageModalBody);
