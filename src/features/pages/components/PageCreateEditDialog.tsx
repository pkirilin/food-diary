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
import { CustomDialogProps } from '../../__shared__/types';

interface PageCreateEditDialogProps extends DialogProps, CustomDialogProps<PageCreateEdit> {
  page?: PageCreateEdit;
}

const PageCreateEditDialog: React.FC<PageCreateEditDialogProps> = ({
  page,
  onDialogConfirm,
  onDialogCancel,
  ...dialogProps
}: PageCreateEditDialogProps) => {
  const initialDate = page ? new Date(page.date) : new Date();
  const [date, setDate] = useState<Date | null>(initialDate);
  const title = page ? 'Edit page' : 'Create page';

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
    <Dialog {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
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
          {page ? 'Save' : 'Create'}
        </Button>
        <Button variant="text" onClick={onDialogCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PageCreateEditDialog;
