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
import { Autocomplete } from '@material-ui/lab';
import { CategoryAutocompleteOption } from '../../categories/models';
import { ConfirmationDialogActionProps } from '../../__shared__/types';

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

interface ProductsFilterDialogProps extends DialogProps, ConfirmationDialogActionProps {}

const ProductsFilterDialog: React.FC<ProductsFilterDialogProps> = ({
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: ProductsFilterDialogProps) => {
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
          ></TextField>
        </Box>
        <Box mt={2}>
          <Autocomplete
            fullWidth
            renderInput={params => (
              <TextField {...params} label="Category" placeholder="Select a category"></TextField>
            )}
            options={categoryAutocompleteOptions}
            getOptionLabel={option => option.name}
            noOptionsText="No categories found"
            onChange={() => {
              return;
            }}
          ></Autocomplete>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={onDialogConfirm}>
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
