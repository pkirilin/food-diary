export interface SelectionPayload {
  selected: boolean;
}

export interface CustomDialogProps {
  onDialogConfirm: React.MouseEventHandler<HTMLButtonElement>;
  onDialogCancel: React.MouseEventHandler<HTMLButtonElement>;
}
