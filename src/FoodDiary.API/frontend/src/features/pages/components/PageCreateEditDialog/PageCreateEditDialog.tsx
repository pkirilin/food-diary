import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogProps,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import format from 'date-fns/format';
import { PageCreateEdit } from 'src/features/pages/models';
import { DialogCustomActionProps } from 'src/features/__shared__/types';
import { getDateForNewPage } from 'src/features/pages/thunks';
import { useAppDispatch, useAppSelector } from 'src/features/__shared__/hooks';

interface PageCreateEditDialogProps extends DialogProps, DialogCustomActionProps<PageCreateEdit> {
  page?: PageCreateEdit;
}

function useInitialDate(isDialogOpened: boolean, page?: PageCreateEdit) {
  const dateForNewPage = useAppSelector(state => state.pages.dateForNewPage);
  const dateForNewPageLoading = useAppSelector(state => state.pages.dateForNewPageLoading);
  const dispatch = useAppDispatch();
  const isNewPage = !page;

  useEffect(() => {
    if (isDialogOpened && isNewPage) {
      dispatch(getDateForNewPage());
    }
  }, [dispatch, isDialogOpened, isNewPage]);

  return useMemo(() => {
    if (!isNewPage) {
      return new Date(page.date);
    }

    if (dateForNewPageLoading === 'succeeded' && dateForNewPage) {
      return new Date(dateForNewPage);
    }

    return new Date();
  }, [dateForNewPage, dateForNewPageLoading, isNewPage, page]);
}

export default function PageCreateEditDialog({
  page,
  onDialogConfirm,
  onDialogCancel,
  ...dialogProps
}: PageCreateEditDialogProps) {
  const { open: isDialogOpened } = dialogProps;
  const initialDate = useInitialDate(isDialogOpened, page);
  const isNewPage = !page;
  const title = isNewPage ? 'New page' : 'Edit page';
  const submitText = isNewPage ? 'Create' : 'Save';
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    if (isDialogOpened) {
      setDate(initialDate);
    }
  }, [initialDate, isDialogOpened]);

  const handleSubmitClick = (): void => {
    if (date) {
      onDialogConfirm({
        date: format(date, 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DatePicker
          label="Page date"
          value={date}
          onChange={value => setDate(value)}
          renderInput={params => (
            <TextField
              {...params}
              margin="normal"
              fullWidth
              autoFocus
              name="Page date"
              placeholder="Select page date"
            ></TextField>
          )}
          inputFormat="dd.MM.yyyy"
        ></DatePicker>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSubmitClick} disabled={!date}>
          {submitText}
        </Button>
        <Button variant="text" onClick={onDialogCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
