import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { AppButton } from 'src/components';
import { useInput } from 'src/hooks';
import { mapToTextInputProps } from 'src/utils/inputMapping';
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
    inputProps: categoryNameInputProps,
    value: categoryName,
    clearValue: clearCategoryName,
    isInvalid: isCategoryNameInvalid,
    isTouched: isCategoryNameTouched,
  } = useInput({
    initialValue: category?.name || '',
    errorHelperText: 'Category name is invalid',
    validate: validateCategoryName,
    mapToInputProps: mapToTextInputProps,
  });

  const isSubmitDisabled = isCategoryNameInvalid || !isCategoryNameTouched;

  useEffect(() => {
    if (isDialogOpened) {
      clearCategoryName();
    }
  }, [isDialogOpened, clearCategoryName, category]);

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
          {...categoryNameInputProps}
          autoFocus
          margin="dense"
          fullWidth
          label="Category name"
          placeholder="Enter category name"
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
