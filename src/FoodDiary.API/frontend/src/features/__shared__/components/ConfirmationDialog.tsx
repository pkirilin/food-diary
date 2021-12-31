import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import { DialogCustomActionProps, MessageDialogProps } from '../types';

interface ConfirmationDialogProps
  extends DialogProps,
    MessageDialogProps,
    DialogCustomActionProps {}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  dialogTitle,
  dialogMessage,
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: ConfirmationDialogProps) => {
  return (
    <Dialog {...dialogProps}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        <Typography>{dialogMessage}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onDialogConfirm}>
          Ok
        </Button>
        <Button variant="text" onClick={onDialogCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
