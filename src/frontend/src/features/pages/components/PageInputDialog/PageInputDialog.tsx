import { Button } from '@mui/material';
import { FC, useEffect } from 'react';
import { AppDialog, DatePicker } from 'src/components';
import { useInput } from 'src/hooks';
import { formatDate } from 'src/utils';
import { mapToDateInputProps } from 'src/utils/inputMapping';
import { validateDate } from 'src/utils/validation';
import { PageCreateEdit } from '../../models';

type PageInputDialogProps = {
  title: string;
  isOpened: boolean;
  submitText: string;
  initialDate: Date;
  onClose: () => void;
  onSubmit: (page: PageCreateEdit) => void;
};

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
    if (isOpened && initialDate) {
      setDate(initialDate);
    }
  }, [initialDate, isOpened, setDate]);

  const handleSubmitClick = (): void => {
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
        <DatePicker
          {...dateInput.inputProps}
          autoFocus
          label="Page date"
          placeholder="Select page date"
        />
      }
      actionSubmit={
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitClick}
          disabled={dateInput.isInvalid || !dateInput.isTouched}
        >
          {submitText}
        </Button>
      }
      actionCancel={
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
      }
    />
  );
};

export default PageInputDialog;
