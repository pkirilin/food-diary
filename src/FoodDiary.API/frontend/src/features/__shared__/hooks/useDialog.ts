import { useState } from 'react';
import { DialogProps } from '@mui/material';
import { BindableHookResult } from './types';
import { DialogCustomActionProps, DialogConfirmActionFn, DialogActionFn } from '../types';

export type DialogBinding<TConfirmedData> = DialogProps & DialogCustomActionProps<TConfirmedData>;

export interface DialogHookResult<TConfirmedData>
  extends BindableHookResult<DialogBinding<TConfirmedData>> {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  show: DialogActionFn;
}

// TODO: make centralized redux modals, remove modal hook
export default function useDialog<TConfirmedData = unknown>(
  confirmAction: DialogConfirmActionFn<TConfirmedData>,
): DialogHookResult<TConfirmedData> {
  const [open, setOpen] = useState(false);

  function openDialog(): void {
    setOpen(true);
  }

  function closeDialog(): void {
    setOpen(false);
  }

  return {
    open,
    setOpen,
    show: openDialog,
    binding: {
      open,
      onClose: closeDialog,
      onDialogCancel: closeDialog,
      onDialogConfirm: data => {
        confirmAction(data);
        closeDialog();
      },
    },
  };
}
