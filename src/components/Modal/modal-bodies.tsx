import React from 'react';
import { ModalBody } from '../../store';
import MessageModalBody from './MessageModalBody';
import ConfirmationModalBody from './ConfirmationModalBody';

export function createMessageModalBody(message: string): ModalBody {
  return <MessageModalBody message={message}></MessageModalBody>;
}

export function createConfirmationModalBody(message: string, confirm: () => void): ModalBody {
  return <ConfirmationModalBody message={message} confirm={confirm}></ConfirmationModalBody>;
}
