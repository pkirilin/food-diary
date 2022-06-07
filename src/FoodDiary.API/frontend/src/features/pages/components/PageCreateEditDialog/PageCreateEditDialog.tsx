import 'date-fns';
import { useEffect, useMemo } from 'react';
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
  const [date, setDate, bindDate, isValidDate] = useValidatedDateInput(null, {
    validate: createDateValidator(true),
    errorHelperText: 'Date is required',
  });

  const { open: isDialogOpened } = dialogProps;
  const isNewPage = !page;
  const initialDate = useInitialDate(isDialogOpened, page);
  const title = isNewPage ? 'New page' : 'Edit page';
  const submitText = isNewPage ? 'Create' : 'Save';

  useEffect(() => {
    if (isDialogOpened) {
      setDate(initialDate);
    }
  }, [initialDate, isDialogOpened, setDate]);

  const handleSubmitClick = (): void => {
    if (date) {
      onDialogConfirm({
        date: dateFnsFormat(date, 'yyyy-MM-dd'),
      });
    }
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
          disabled={!isValidDate}
        >
          {submitText}
        </Button>
        <Button variant="text" onClick={onDialogCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
