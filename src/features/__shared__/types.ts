export interface SelectionPayload {
  selected: boolean;
}

export interface MessageDialogProps {
  dialogTitle: string;
  dialogMessage: string;
}

export interface ConfirmationDialogActionProps<TConfirmedData = unknown> {
  onDialogConfirm: (data: TConfirmedData) => void;
  onDialogCancel: () => void;
}
