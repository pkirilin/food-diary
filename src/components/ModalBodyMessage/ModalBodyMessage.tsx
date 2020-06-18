import React from 'react';
import { Container, Button } from '../__ui__';
import { ModalBodyMessageDispatchToPropsMapResult } from './ModalBodyMessageConnected';

export interface ModalBodyMessageProps extends ModalBodyMessageDispatchToPropsMapResult {
  message: string;
}

const ModalBodyMessage: React.FC<ModalBodyMessageProps> = ({ message, closeModal }: ModalBodyMessageProps) => {
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

export default ModalBodyMessage;
