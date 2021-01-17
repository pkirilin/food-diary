import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { ProductCreateEdit } from '../models';
import { ConfirmationDialogActionProps } from '../../__shared__/types';
import { useInput } from '../../__shared__/hooks';
import { CategoryAutocompleteInput } from '../../categories/components';

interface ProductCreateEditDialogProps
  extends DialogProps,
    ConfirmationDialogActionProps<ProductCreateEdit> {
  product?: ProductCreateEdit;
}

const ProductCreateEditDialog: React.FC<ProductCreateEditDialogProps> = ({
  product,
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: ProductCreateEditDialogProps) => {
  const { title, submitText, initialProductName, initialCaloriesCost } = product
    ? {
        title: 'Edit product',
        submitText: 'Save',
        initialProductName: product.name,
        initialCaloriesCost: product.caloriesCost,
        // initialCategoryId: product.categoryId,
      }
    : {
        title: 'New product',
        submitText: 'Create',
        initialProductName: '',
        initialCaloriesCost: 100,
        // initialCategoryId: 0,
      };

  const productNameInput = useInput(initialProductName);
  const caloriesCostInput = useInput(initialCaloriesCost);

  const handleSubmitClick = (): void => {
    onDialogConfirm({
      name: productNameInput.value,
      caloriesCost: caloriesCostInput.value,
      categoryId: 0,
    });
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box>
          <TextField
            fullWidth
            autoFocus
            label="Product name"
            placeholder="Enter product name"
            {...productNameInput.binding}
          ></TextField>
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            label="Calories cost"
            placeholder="Enter calories cost"
            {...caloriesCostInput.binding}
          ></TextField>
        </Box>
        <Box mt={2}>
          <CategoryAutocompleteInput></CategoryAutocompleteInput>
        </Box>
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

export default ProductCreateEditDialog;
