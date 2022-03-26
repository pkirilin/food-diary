import React, { useEffect, useState } from 'react';
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
import { useValidatedNumericInput, useValidatedTextInput } from '../../__shared__/hooks';
import CategorySelect from './CategorySelect';

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

  const [productName, setProductName, bindProductName, isValidProductName] = useValidatedTextInput(
    initialProductName,
    {
      validate: productName => productName.length >= 3 && productName.length <= 50,
      errorHelperText: 'Product name is invalid',
    },
  );

  const [caloriesCost, setCaloriesCost, bindCaloriesCost, isValidCaloriesCost] =
    useValidatedNumericInput(initialCaloriesCost, {
      validate: caloriesCost => caloriesCost > 0 && caloriesCost < 5000,
      errorHelperText: 'Calories cost is invalid',
    });

  const [category, setCategory] = useState(initialCategory);

  const isSubmitDisabled = !isValidProductName || !isValidCaloriesCost || !category;

  useEffect(() => {
    if (dialogProps.open) {
      setProductName(initialProductName);
      setCaloriesCost(initialCaloriesCost);
      setCategory(initialCategory);
    }
  }, [dialogProps.open]);

  const handleSubmitClick = (): void => {
    if (category) {
      onDialogConfirm({
        name: productName,
        caloriesCost,
        categoryId: category.id,
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          {...bindProductName()}
          label="Product name"
          placeholder="Enter product name"
          margin="normal"
          fullWidth
          autoFocus
        ></TextField>
        <TextField
          {...bindCaloriesCost()}
          type="number"
          label="Calories cost"
          placeholder="Enter calories cost"
          margin="normal"
          fullWidth
        ></TextField>
        <CategorySelect
          value={initialCategory}
          setValue={value => setCategory(value)}
        ></CategorySelect>
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

export default ProductCreateEditDialog;
