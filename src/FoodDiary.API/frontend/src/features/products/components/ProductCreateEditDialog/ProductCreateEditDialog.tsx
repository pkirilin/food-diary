import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { CategoryAutocompleteOption } from 'src/features/categories';
import { ProductCreateEdit, ProductItem } from 'src/features/products';
import { useValidatedNumericInput, useValidatedTextInput } from 'src/hooks';
import { AutocompleteOption, DialogCustomActionProps } from 'src/types';
import CategorySelect from '../CategorySelect';

interface ProductCreateEditDialogProps
  extends DialogProps,
    DialogCustomActionProps<ProductCreateEdit> {
  product?: ProductItem;
}

function useInitialCategory(product?: ProductItem) {
  const isNewProduct = !product;

  return useMemo<CategoryAutocompleteOption | null>(() => {
    if (isNewProduct) {
      return null;
    }

    return {
      id: product.categoryId,
      name: product.categoryName,
    };
  }, [isNewProduct, product]);
}

const ProductCreateEditDialog: React.FC<ProductCreateEditDialogProps> = ({
  product,
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}) => {
  const isNewProduct = !product;
  const initialProductName = isNewProduct ? '' : product.name;
  const initialCaloriesCost = isNewProduct ? 100 : product.caloriesCost;
  const initialCategory = useInitialCategory(product);
  const title = isNewProduct ? 'New product' : 'Edit product';
  const submitText = isNewProduct ? 'Create' : 'Save';

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
    initialCaloriesCost,
    initialCategory,
    initialProductName,
    setCaloriesCost,
    setProductName,
  ]);

  function handleCategoryChange(value: AutocompleteOption | null) {
    setCategory(value);
  }

  function handleSubmitClick() {
    if (category) {
      onDialogConfirm({
        name: productName,
        caloriesCost,
        categoryId: category.id,
      });
    }
  }

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
        />
        <TextField
          {...bindCaloriesCost()}
          type="number"
          label="Calories cost"
          placeholder="Enter calories cost"
          margin="normal"
          fullWidth
        />
        <CategorySelect
          label="Category"
          placeholder="Select a category"
          value={category}
          setValue={handleCategoryChange}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitClick}
          disabled={isSubmitDisabled}
          aria-label={`${product ? 'Save' : 'Create'} ${productName} and close dialog`}
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
