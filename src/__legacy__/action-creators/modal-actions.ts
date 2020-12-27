import { OpenModalAction, ModalActionTypes, CloseModalAction } from '../action-types';
import { ModalBody, ModalOptions } from '../store';
import { createMessageModalBody, createConfirmationModalBody } from '../components/Modal';

export const openModal = (title: string, body: ModalBody, options?: ModalOptions): OpenModalAction => {
  return {
    type: ModalActionTypes.Open,
    title,
    body,
    options,
  };
};

export const openMessageModal = (
  title: string,
  message: string,
  options: ModalOptions = {
    width: '40%',
  },
): OpenModalAction => {
  return {
    type: ModalActionTypes.Open,
    title,
    body: createMessageModalBody(message),
    options,
  };
};

export const openConfirmationModal = (
  title: string,
  message: string,
  confirm: () => void,
  options: ModalOptions = {
    width: '40%',
  },
): OpenModalAction => {
  return {
    type: ModalActionTypes.Open,
    title,
    body: createConfirmationModalBody(message, confirm),
    options,
  };
};

export const closeModal = (): CloseModalAction => {
  return {
    type: ModalActionTypes.Close,
  };
};
