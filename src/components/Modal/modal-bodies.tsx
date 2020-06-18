import React from 'react';
import { ModalBody } from '../../store';
import ModalBodyMessageConnected from '../ModalBodyMessage';
import ModalBodyConfirmationConnected from '../ModalBodyConfirmation';

export function createMessageModalBody(message: string): ModalBody {
  return <ModalBodyMessageConnected message={message}></ModalBodyMessageConnected>;
}

export function createConfirmationModalBody(message: string, confirm: () => void): ModalBody {
  return <ModalBodyConfirmationConnected message={message} confirm={confirm}></ModalBodyConfirmationConnected>;
}
