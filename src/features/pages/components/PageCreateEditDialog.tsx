import 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogProps,
} from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { PageCreateEdit } from '../models';
import { DialogCustomActionProps } from '../../__shared__/types';

interface PageCreateEditDialogProps extends DialogProps, DialogCustomActionProps<PageCreateEdit> {
  page?: PageCreateEdit;
}

const PageCreateEditDialog: React.FC<PageCreateEditDialogProps> = ({
  page,
  onDialogConfirm,
  onDialogCancel,
  ...dialogProps
}: PageCreateEditDialogProps) => {
  const { title, submitText, initialDate } = page
    ? {
        title: 'Edit page',
        submitText: 'Save',
        initialDate: new Date(page.date),
      }
    : {
        title: 'New page',
        submitText: 'Create',
        initialDate: new Date(),
      };

  const [date, setDate] = useState<Date | null>(initialDate);

  useEffect(() => {
    return () => {
      setDate(initialDate);
    };
  }, [dialogProps.open]);

  const handleDateChange = (date: Date | null) => {
    setDate(date);
  };

  const handleSubmitClick = (): void => {
    if (date) {
      onDialogConfirm({
        date: date.toISOString().slice(0, 10),
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            autoFocus
            fullWidth
            variant="inline"
            format="dd.MM.yyyy"
            margin="normal"
            value={date}
            onChange={handleDateChange}
          />
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSubmitClick}>
          {submitText}
        </Button>
        <Button variant="text" onClick={onDialogCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PageCreateEditDialog;
