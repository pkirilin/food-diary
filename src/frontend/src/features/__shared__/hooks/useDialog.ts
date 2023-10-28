import { DialogProps } from '@mui/material';
import { useState } from 'react';
import { DialogCustomActionProps, DialogConfirmActionFn, DialogActionFn } from '../types';
import { BindableHookResult } from './types';

export type DialogBinding<TConfirmedData> = DialogProps & DialogCustomActionProps<TConfirmedData>;

export interface DialogHookResult<TConfirmedData>
  extends BindableHookResult<DialogBinding<TConfirmedData>> {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  show: DialogActionFn;
}

/**
 @deprecated
 */
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
