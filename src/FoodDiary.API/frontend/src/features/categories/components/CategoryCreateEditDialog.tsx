import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { CategoryCreateEdit } from '../models';
import { DialogCustomActionProps } from '../../__shared__/types';
import { useValidatedTextInput } from '../../__shared__/hooks';

interface CategoryCreateEditDialogProps
  extends DialogProps,
    DialogCustomActionProps<CategoryCreateEdit> {
  category?: CategoryCreateEdit;
}

const CategoryCreateEditDialog: React.FC<CategoryCreateEditDialogProps> = ({
  category,
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: CategoryCreateEditDialogProps) => {
  const { title, submitText, initialCategoryName } = category
    ? {
        title: 'Edit category',
        submitText: 'Save',
        initialCategoryName: category.name,
      }
    : {
        title: 'New category',
        submitText: 'Create',
        initialCategoryName: '',
      };

  const [categoryName, setCategoryName, bindCategoryName, isValidCategoryName] =
    useValidatedTextInput(initialCategoryName, {
      validate: categoryName => categoryName.length >= 3 && categoryName.length <= 50,
      errorHelperText: 'Category name is invalid',
    });

  const isSubmitDisabled = !isValidCategoryName;

  useEffect(() => {
    if (dialogProps.open) {
      setCategoryName(initialCategoryName);
    }
  }, [dialogProps.open]);

  const handleSubmitClick = (): void => {
    onDialogConfirm({
      name: categoryName,
    });
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          {...bindCategoryName()}
          label="Category name"
          placeholder="Enter category name"
          fullWidth
          autoFocus
        ></TextField>
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

export default CategoryCreateEditDialog;
