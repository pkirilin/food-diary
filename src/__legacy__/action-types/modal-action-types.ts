import { Action } from 'redux';
import { ModalBody, ModalOptions } from '../store';

export enum ModalActionTypes {
  Open = 'MODAL_OPEN',
  Close = 'MODAL_CLOSE',
}

export interface OpenModalAction extends Action<ModalActionTypes.Open> {
  type: ModalActionTypes.Open;
  title: string;
  body: ModalBody;
  options?: ModalOptions;
}

export interface CloseModalAction extends Action<ModalActionTypes.Close> {
  type: ModalActionTypes.Close;
}

export type ModalActions = OpenModalAction | CloseModalAction;
