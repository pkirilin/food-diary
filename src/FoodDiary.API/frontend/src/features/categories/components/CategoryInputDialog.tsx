import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { AppButton } from 'src/components';
import { useValidatedState } from 'src/hooks';
import { validateCategoryName } from 'src/utils/validation';
import { Category, CategoryFormData } from '../types';

type CreateEditCategoryDialogProps = {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  title: string;
  submitText: string;
  onSubmit: (category: CategoryFormData) => void;
  isLoading: boolean;
  category?: Category;
};

const CategoryInputDialog: React.FC<CreateEditCategoryDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  title,
  submitText,
  onSubmit,
  isLoading,
  category,
}) => {
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

  function handleCategoryNameChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setCategoryName(event.target.value);
  }

  function handleClose() {
    setIsDialogOpened(false);
  }

  function handleSubmit() {
    onSubmit({ name: categoryName });
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
          onChange={handleCategoryNameChange}
          helperText={categoryNameHelperText}
          error={isCategoryNameInvalid}
        />
      </DialogContent>

      <DialogActions>
        <AppButton disabled={isLoading} onClick={handleClose}>
          Cancel
        </AppButton>

        <AppButton
          aria-label={`${category ? 'Save' : 'Create'} ${categoryName} and close dialog`}
          variant="contained"
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
          isLoading={isLoading}
        >
          {submitText}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryInputDialog;
