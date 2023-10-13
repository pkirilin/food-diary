import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogProps,
} from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { DatePicker } from 'src/components';
import { useAppDispatch, useAppSelector } from 'src/features/__shared__/hooks';
import { DialogCustomActionProps } from 'src/features/__shared__/types';
import { PageCreateEdit } from 'src/features/pages/models';
import { getDateForNewPage } from 'src/features/pages/thunks';
import { useInput } from 'src/hooks';
import { formatDate } from 'src/utils';
import { mapToDateInputProps } from 'src/utils/inputMapping';
import { validateDate } from 'src/utils/validation';

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

const PageCreateEditDialog: React.FC<PageCreateEditDialogProps> = ({
  page,
  onDialogConfirm,
  onDialogCancel,
  ...dialogProps
}) => {
  const { open: isDialogOpened } = dialogProps;
  const initialDate = useInitialDate(isDialogOpened, page);
  const isNewPage = !page;
  const title = isNewPage ? 'New page' : 'Edit page';
  const submitText = isNewPage ? 'Create' : 'Save';

  const {
    inputProps: dateInputProps,
    value: date,
    setValue: setDate,
    isInvalid: isDateInvalid,
  } = useInput({
    initialValue: null,
    errorHelperText: 'Date is required',
    validate: validateDate,
    mapToInputProps: mapToDateInputProps,
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
          {...dateInputProps}
          autoFocus
          label="Page date"
          placeholder="Select page date"
        />
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
};

export default PageCreateEditDialog;
