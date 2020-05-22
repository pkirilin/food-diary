export interface ModalState {
  isOpened: boolean;
  title: string;
  body: ModalBody;
}

export type ModalBody = string | JSX.Element;
