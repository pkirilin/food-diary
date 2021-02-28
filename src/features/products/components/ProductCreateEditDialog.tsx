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
import { ProductCreateEdit, ProductItem } from '../models';
import { DialogCustomActionProps } from '../../__shared__/types';
import { useInput } from '../../__shared__/hooks';
import { SimpleAutocomplete } from '../../__shared__/components';
import { useCategoryAutocompleteInput } from '../../categories/hooks';

interface ProductCreateEditDialogProps
  extends DialogProps,
    DialogCustomActionProps<ProductCreateEdit> {
  product?: ProductItem;
}

const ProductCreateEditDialog: React.FC<ProductCreateEditDialogProps> = ({
  product,
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: ProductCreateEditDialogProps) => {
  const { title, submitText, initialProductName, initialCaloriesCost, initialCategory } = product
    ? {
        title: 'Edit product',
        submitText: 'Save',
        initialProductName: product.name,
        initialCaloriesCost: product.caloriesCost,
        initialCategory: {
          id: product.categoryId,
          name: product.categoryName,
        },
      }
    : {
        title: 'New product',
        submitText: 'Create',
        initialProductName: '',
        initialCaloriesCost: 100,
        initialCategory: null,
      };

  const productNameInput = useInput(initialProductName);
  const caloriesCostInput = useInput(initialCaloriesCost);
  const [category, setCategory, bindCategory] = useCategoryAutocompleteInput(initialCategory);
  // const categoryInput = useInputAutocomplete(initialCategory);

  useEffect(() => {
    if (dialogProps.open) {
      setCategory(initialCategory);
    }

    return () => {
      productNameInput.setValue(initialProductName);
      caloriesCostInput.setValue(initialCaloriesCost);
      setCategory(initialCategory);
    };
  }, [dialogProps.open]);

  const handleSubmitClick = (): void => {
    if (category) {
      onDialogConfirm({
        name: productNameInput.value,
        caloriesCost: caloriesCostInput.value,
        categoryId: category.id,
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          {...productNameInput.binding}
          label="Product name"
          placeholder="Enter product name"
          margin="normal"
          fullWidth
          autoFocus
        ></TextField>
        <TextField
          {...caloriesCostInput.binding}
          type="number"
          label="Calories cost"
          placeholder="Enter calories cost"
          margin="normal"
          fullWidth
        ></TextField>
        <SimpleAutocomplete
          {...bindCategory()}
          inputLabel="Category"
          inputPlaceholder="Select a category"
        ></SimpleAutocomplete>
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
