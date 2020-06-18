import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { CloseModalAction } from '../../action-types';
import { closeModal } from '../../action-creators';
import { Button, Container } from '../__ui__';

export interface MessageModalBodyProps extends MessageBodyDispatchToPropsMapResult {
  message: string;
}

interface MessageBodyDispatchToPropsMapResult {
  closeModal: () => void;
}

const MessageModalBody: React.FC<MessageModalBodyProps> = ({ message, closeModal }: MessageModalBodyProps) => {
  return (
    <Container direction="column" spaceBetweenChildren="large">
      <p>{message}</p>
      <Container justify="flex-end">
        <Container col="4">
          <Button
            onClick={(): void => {
              closeModal();
            }}
          >
            OK
          </Button>
        </Container>
      </Container>
    </Container>
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
