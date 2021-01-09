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
import { ConfirmationDialogActionProps } from '../../__shared__/types';
import { useInput } from '../../__shared__/hooks';

interface CategoryCreateEditDialogProps
  extends DialogProps,
    ConfirmationDialogActionProps<CategoryCreateEdit> {
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

  const categoryNameInput = useInput(initialCategoryName);

  useEffect(() => {
    return () => {
      categoryNameInput.setValue(initialCategoryName);
    };
  }, [dialogProps.open]);

  const handleSubmitClick = (): void => {
    onDialogConfirm({
      name: categoryNameInput.value,
    });
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          {...categoryNameInput.binding}
          label="Category name"
          placeholder="Enter category name"
          fullWidth
          autoFocus
        ></TextField>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSubmitClick}>
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
