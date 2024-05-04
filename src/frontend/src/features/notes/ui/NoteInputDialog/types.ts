import { type ReactElement } from 'react';

export type DialogStateType = 'note' | 'product';

export interface DialogState {
  type: DialogStateType;
  title: string;
  submitText: string;
  submitLoading: boolean;
  submitDisabled: boolean;
  cancelDisabled: boolean;
  formId: string;
  content: ReactElement;
  onClose: () => void;
}
