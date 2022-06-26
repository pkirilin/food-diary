import { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogProps,
} from '@mui/material';
import { DatePicker } from 'src/components';
import { PageCreateEdit } from 'src/features/pages/models';
import { DialogCustomActionProps } from 'src/features/__shared__/types';
import { getDateForNewPage } from 'src/features/pages/thunks';
import { useAppDispatch, useAppSelector } from 'src/features/__shared__/hooks';
import { formatDate, validateDate } from 'src/utils';
import { useValidatedState } from 'src/hooks';

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

  const {
    value: date,
    setValue: setDate,
    isInvalid: isDateInvalid,
    helperText: dateHelperText,
  } = useValidatedState<Date | null>({
    initialValue: null,
    errorHelperText: 'Date is required',
    validatorFunction: validateDate,
  });

  useEffect(() => {
    if (isDialogOpened && initialDate) {
      setDate(initialDate);
    }
  }, [initialDate, isDialogOpened, setDate]);

  const handleSubmitClick = (): void => {
    if (date) {
      onDialogConfirm({
        date: formatDate(date),
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DatePicker
          label="Page date"
          placeholder="Select page date"
          date={date}
          onChange={value => setDate(value)}
          isInvalid={isDateInvalid}
          helperText={dateHelperText}
          autoFocus
        ></DatePicker>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitClick}
          disabled={isDateInvalid}
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
