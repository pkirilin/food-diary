export interface SelectionPayload {
  selected: boolean;
}

export interface CustomDialogProps<TConfirmedData = unknown> {
  onDialogConfirm: (data: TConfirmedData) => void;
  onDialogCancel: () => void;
}
