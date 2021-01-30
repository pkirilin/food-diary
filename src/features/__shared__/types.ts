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
