import React, { useState } from 'react';
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
import { Autocomplete } from '@material-ui/lab';
import { ProductCreateEdit } from '../models';
import { ConfirmationDialogActionProps } from '../../__shared__/types';
import { useInput } from '../../__shared__/hooks';
import { CategoryAutocompleteOption } from '../../categories/models';

const categoryAutocompleteOptions: CategoryAutocompleteOption[] = [
  {
    id: 1,
    name: 'Category 1',
  },
  {
    id: 2,
    name: 'Category 2',
  },
];

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
  const { title, submitText, initialProductName, initialCaloriesCost, initialCategoryId } = product
    ? {
        title: 'Edit product',
        submitText: 'Save',
        initialProductName: product.name,
        initialCaloriesCost: product.caloriesCost,
        initialCategoryId: product.categoryId,
      }
    : {
        title: 'New product',
        submitText: 'Create',
        initialProductName: '',
        initialCaloriesCost: 100,
        initialCategoryId: null,
      };

  const productNameInput = useInput(initialProductName);
  const caloriesCostInput = useInput(initialCaloriesCost);
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  const handleSubmitClick = (): void => {
    if (categoryId !== null) {
      onDialogConfirm({
        name: productNameInput.value,
        caloriesCost: caloriesCostInput.value,
        categoryId,
      });
    }
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
          <Autocomplete
            renderInput={params => (
              <TextField {...params} label="Category" placeholder="Select a category"></TextField>
            )}
            options={categoryAutocompleteOptions}
            getOptionLabel={option => option.name}
            noOptionsText="No categories found"
            onChange={(event, value) => {
              setCategoryId(value?.id ?? null);
            }}
          ></Autocomplete>
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
