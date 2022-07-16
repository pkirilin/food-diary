import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useValidatedState } from 'src/hooks';
import { validateCategoryName } from 'src/utils/validation';
import { CategoryCreateEdit } from '../types';

type CreateEditCategoryDialogProps = {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  title: string;
  submitText: string;
  category?: CategoryCreateEdit;
};

export default function CreateEditCategoryDialog({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  title,
  submitText,
  category,
}: CreateEditCategoryDialogProps) {
  const {
    value: categoryName,
    setValue: setCategoryName,
    clearValue: clearCategoryName,
    helperText: categoryNameHelperText,
    isInvalid: isCategoryNameInvalid,
    isTouched: isCategoryNameTouched,
  } = useValidatedState({
    initialValue: '',
    errorHelperText: 'Category name is invalid',
    validatorFunction: validateCategoryName,
  });

  const isSubmitDisabled = isCategoryNameInvalid || !isCategoryNameTouched;

  useEffect(() => {
    if (isDialogOpened) {
      clearCategoryName();

      if (category) {
        setCategoryName(category.name);
      }
    }
  }, [isDialogOpened, clearCategoryName, category, setCategoryName]);

  function handleClose() {
    setIsDialogOpened(false);
  }

  function handleSubmit() {
    // eslint-disable-next-line no-console
    console.log(categoryName);
  }

  return (
    <Dialog open={isDialogOpened} onClose={handleClose} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          label="Category name"
          placeholder="Enter category name"
          value={categoryName}
          onChange={event => setCategoryName(event.target.value)}
          helperText={categoryNameHelperText}
          error={isCategoryNameInvalid}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          aria-label={`${category ? 'Save' : 'Create'} ${categoryName} and close dialog`}
          variant="contained"
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
