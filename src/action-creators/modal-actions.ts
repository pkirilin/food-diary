import { OpenModalAction, ModalActionTypes, CloseModalAction } from '../action-types';
import { ModalBody, ModalOptions } from '../store';

export const openModal = (title: string, body: ModalBody, options?: ModalOptions): OpenModalAction => {
  return {
    type: ModalActionTypes.Open,
    title,
    body,
    options,
  };
};

export const closeModal = (): CloseModalAction => {
  return {
    type: ModalActionTypes.Close,
  };
};
