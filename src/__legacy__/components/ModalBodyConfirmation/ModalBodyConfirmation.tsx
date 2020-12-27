import React from 'react';
import { ModalBodyMessageProps } from '../ModalBodyMessage';
import { ModalBodyConfirmationDispatchToPropsMapResult } from './ModalBodyConfirmationConnected';
import { Container, Button } from '../__ui__';
import { useFocus } from '../../hooks';

interface ModalBodyConfirmationProps extends ModalBodyMessageProps, ModalBodyConfirmationDispatchToPropsMapResult {
  confirm: () => void;
}

const ModalBodyConfirmation: React.FC<ModalBodyConfirmationProps> = ({
  message,
  confirm,
  closeModal,
}: ModalBodyConfirmationProps) => {
  const elementToFocusRef = useFocus<HTMLInputElement>();

  return (
    <Container direction="column" spaceBetweenChildren="large">
      <p>{message}</p>
      <Container justify="flex-end" spaceBetweenChildren="medium">
        <Container col="4">
          <Button
            inputRef={elementToFocusRef}
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
            variant="text"
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

export default ModalBodyConfirmation;
