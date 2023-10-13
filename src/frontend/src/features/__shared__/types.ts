export interface SelectionPayload {
  selected: boolean;
}

export interface MessageDialogProps {
  dialogTitle: string;
  dialogMessage: string;
}

export type DialogActionFn = () => void;
export type DialogConfirmActionFn<TConfirmedData> = (data: TConfirmedData) => void;

export interface DialogCustomActionProps<TConfirmedData = unknown> {
  onDialogConfirm: DialogConfirmActionFn<TConfirmedData>;
  onDialogCancel: DialogActionFn;
}

export interface SelectProps<TOption> {
  label?: string;
  placeholder?: string;
  value?: TOption | null;
  setValue: (value: TOption | null) => void;
  helperText?: string;
  isInvalid?: boolean;
}
