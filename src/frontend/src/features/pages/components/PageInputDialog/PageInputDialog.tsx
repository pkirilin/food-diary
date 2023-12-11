import { Button } from '@mui/material';
import { type FC, useEffect, type FormEventHandler } from 'react';
import { AppDialog, DatePicker } from 'src/components';
import { useInput } from 'src/hooks';
import { formatDate } from 'src/utils';
import { mapToDateInputProps } from 'src/utils/inputMapping';
import { validateDate } from 'src/utils/validation';
import { type PageCreateEdit } from '../../models';

interface PageInputDialogProps {
  title: string;
  isOpened: boolean;
  submitText: string;
  initialDate: Date;
  onClose: () => void;
  onSubmit: (page: PageCreateEdit) => void;
}

const PageInputDialog: FC<PageInputDialogProps> = ({
  title,
  isOpened,
  submitText,
  initialDate,
  onClose,
  onSubmit,
}) => {
  const dateInput = useInput({
    initialValue: initialDate,
    errorHelperText: 'Date is required',
    validate: validateDate,
    mapToInputProps: mapToDateInputProps,
  });

  const setDate = dateInput.setValue;

  useEffect(() => {
    if (isOpened) {
      setDate(initialDate);
    }
  }, [initialDate, isOpened, setDate]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (dateInput.value) {
      onSubmit({
        date: formatDate(dateInput.value),
      });
    }
  };

  return (
    <AppDialog
      title={title}
      isOpened={isOpened}
      onClose={onClose}
      content={
        <form id="page-input-form" onSubmit={handleSubmit}>
          <DatePicker
            {...dateInput.inputProps}
            autoFocus
            label="Page date"
            placeholder="Select page date"
          />
        </form>
      }
      actionSubmit={
        <Button
          type="submit"
          form="page-input-form"
          variant="contained"
          color="primary"
          disabled={dateInput.isInvalid || !dateInput.isTouched}
        >
          {submitText}
        </Button>
      }
      actionCancel={
        <Button type="button" variant="text" onClick={onClose}>
          Cancel
        </Button>
      }
    />
  );
};

export default PageInputDialog;
