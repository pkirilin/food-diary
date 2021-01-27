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
import { ConfirmationDialogActionProps } from '../../__shared__/types';
import { useInput, useTypedSelector } from '../../__shared__/hooks';
import { CategoryAutocomplete } from '../../categories/components';
import { ProductsFilterUpdatedData } from '../models';

interface ProductsFilterDialogProps
  extends DialogProps,
    ConfirmationDialogActionProps<ProductsFilterUpdatedData> {}

const ProductsFilterDialog: React.FC<ProductsFilterDialogProps> = ({
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: ProductsFilterDialogProps) => {
  const currentFilter = useTypedSelector(state => state.products.filter);
  const productSearchNameInput = useInput(currentFilter.productSearchName ?? '');
  const [categoryId, setCategoryId] = useState(currentFilter.categoryId);

  const handleSubmitClick = (): void => {
    onDialogConfirm({
      productSearchName: productSearchNameInput.value,
      categoryId,
    });
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>Products filter</DialogTitle>
      <DialogContent>
        <Box>
          <TextField
            fullWidth
            autoFocus
            label="Product name"
            placeholder="Enter product name"
            {...productSearchNameInput.binding}
          ></TextField>
        </Box>
        <Box mt={2}>
          <CategoryAutocomplete
            initialCategoryId={categoryId}
            onChange={(event, value) => {
              setCategoryId(value?.id ?? null);
            }}
          ></CategoryAutocomplete>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={handleSubmitClick}>
          Apply
        </Button>
        <Button variant="text" onClick={onDialogCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductsFilterDialog;
