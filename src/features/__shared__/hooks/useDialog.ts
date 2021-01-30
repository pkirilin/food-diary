import { useState } from 'react';
import { DialogProps } from '@material-ui/core';
import { BindableHookResult } from './types';
import { DialogCustomActionProps, DialogConfirmActionFn } from '../types';

export type DialogBinding<TConfirmedData> = DialogProps & DialogCustomActionProps<TConfirmedData>;

export interface DialogHookResult<TConfirmedData>
  extends BindableHookResult<DialogBinding<TConfirmedData>> {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useDialog<TConfirmedData = unknown>(
  confirmAction: DialogConfirmActionFn<TConfirmedData>,
): DialogHookResult<TConfirmedData> {
  const [open, setOpen] = useState(false);

  function closeDialog(): void {
    setOpen(false);
  }

  return {
    open,
    setOpen,
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
