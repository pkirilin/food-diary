import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { ProductCreateEdit, ProductItem } from 'src/features/products/models';
import { DialogCustomActionProps } from 'src/features/__shared__/types';
import { useValidatedNumericInput, useValidatedTextInput } from 'src/features/__shared__/hooks';
import CategorySelect from '../CategorySelect';
import { CategoryAutocompleteOption } from 'src/features/categories/models';

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
  const title = product ? 'Edit product' : 'New product';
  const submitText = product ? 'Save' : 'Create';
  const initialProductName = product ? product.name : '';
  const initialCaloriesCost = product ? product.caloriesCost : 100;

  const initialCategory = useMemo<CategoryAutocompleteOption | null>(
    () =>
      product
        ? {
            id: product.categoryId,
            name: product.categoryName,
          }
        : null,
    [product],
  );

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
  }, [
    dialogProps.open,
    setProductName,
    setCaloriesCost,
    initialProductName,
    initialCaloriesCost,
    initialCategory,
  ]);

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
          label="Product"
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
          label="Category"
          placeholder="Select a category"
          value={category}
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