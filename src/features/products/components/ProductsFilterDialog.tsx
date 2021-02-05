import React, { useEffect, useState } from 'react';
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
import { DialogCustomActionProps } from '../../__shared__/types';
import { useInput, useTypedSelector } from '../../__shared__/hooks';
import { CategoryAutocomplete } from '../../categories/components';
import { ProductsFilterUpdatedData } from '../models';

interface ProductsFilterDialogProps
  extends DialogProps,
    DialogCustomActionProps<ProductsFilterUpdatedData> {}

const ProductsFilterDialog: React.FC<ProductsFilterDialogProps> = ({
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: ProductsFilterDialogProps) => {
  const currentFilter = useTypedSelector(state => state.products.filter);
  const productSearchNameInput = useInput(currentFilter.productSearchName ?? '');
  const [category, setCategory] = useState(currentFilter.category);

  useEffect(() => {
    return () => {
      productSearchNameInput.setValue(currentFilter.productSearchName ?? '');
      setCategory(currentFilter.category);
    };
  }, [dialogProps.open]);

  const handleSubmitClick = (): void => {
    onDialogConfirm({
      productSearchName: productSearchNameInput.value,
      category,
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
            value={category}
            onChange={(event, value) => {
              setCategory(value);
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
