import 'date-fns';
import React, { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogProps,
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import dateFnsFormat from 'date-fns/format';
import { PageCreateEdit } from 'src/features/pages/models';
import { DialogCustomActionProps } from 'src/features/__shared__/types';
import { getDateForNewPage } from 'src/features/pages/thunks';
import {
  useAppDispatch,
  useAppSelector,
  useValidatedDateInput,
} from 'src/features/__shared__/hooks';
import { createDateValidator } from 'src/features/__shared__/validators';

interface PageCreateEditDialogProps extends DialogProps, DialogCustomActionProps<PageCreateEdit> {
  page?: PageCreateEdit;
}

const PageCreateEditDialog: React.FC<PageCreateEditDialogProps> = ({
  page,
  onDialogConfirm,
  onDialogCancel,
  ...dialogProps
}: PageCreateEditDialogProps) => {
  const dateForNewPage = useAppSelector(state => state.pages.dateForNewPage);
  const dateForNewPageLoading = useAppSelector(state => state.pages.dateForNewPageLoading);

  const dispatch = useAppDispatch();

  const initialDate = useMemo(() => {
    if (page) {
      return new Date(page.date);
    }

    if (dateForNewPage) {
      return new Date(dateForNewPage);
    }

    return new Date();
  }, [page, dateForNewPage]);

  const title = page ? 'Edit page' : 'New page';
  const submitText = page ? 'Save' : 'Create';

  const [date, setDate, bindDate, isValidDate] = useValidatedDateInput(initialDate, {
    validate: createDateValidator(true),
    errorHelperText: 'Date is required',
  });

  const isSubmitDisabled = !isValidDate;

  useEffect(() => {
    if (dialogProps.open) {
      setDate(initialDate);

      if (!page) {
        dispatch(getDateForNewPage());
      }
    }
  }, [dialogProps.open, initialDate, setDate, page, dispatch]);

  useEffect(() => {
    if (dateForNewPageLoading === 'succeeded' && !page) {
      setDate(dateForNewPage ? new Date(dateForNewPage) : null);
    }
  }, [dateForNewPage, dateForNewPageLoading, page, setDate]);

  const handleSubmitClick = (): void => {
    if (!date) {
      return;
    }

    onDialogConfirm({
      date: dateFnsFormat(date, 'yyyy-MM-dd'),
    });
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <KeyboardDatePicker
          {...bindDate()}
          label="Page date"
          inputProps={{ 'aria-label': 'Page date' }}
          placeholder="dd.MM.yyyy"
          format="dd.MM.yyyy"
          margin="normal"
          fullWidth
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitClick}
          disabled={isSubmitDisabled}
        >
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
