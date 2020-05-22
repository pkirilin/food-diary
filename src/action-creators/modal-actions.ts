import { OpenModalAction, ModalActionTypes, CloseModalAction } from '../action-types';
import { ModalBody } from '../store';

export const openModal = (title: string, body: ModalBody): OpenModalAction => {
  return {
    type: ModalActionTypes.Open,
    title,
    body,
  };
};

export const closeModal = (): CloseModalAction => {
  return {
    type: ModalActionTypes.Close,
  };
};
