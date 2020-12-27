export interface ModalState {
  isOpened: boolean;
  title: string;
  body: ModalBody;
  options: ModalOptions;
}

export type ModalBody = string | JSX.Element;

export interface ModalOptions {
  width?: string | number;
}
