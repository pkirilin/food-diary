import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { AppButton } from 'src/components';
import { CategoryAutocompleteOption } from 'src/features/categories';
import { useValidatedState } from 'src/hooks';
import { validateCaloriesCost, validateProductName } from 'src/utils/validation';
import { ProductFormData } from '../types';
import CategorySelect from './CategorySelect';

type ProductInputDialogProps = {
  isOpened: boolean;
  setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  submitText: string;
  onSubmit: (product: ProductFormData) => void;
  isLoading: boolean;
  product?: ProductFormData;
};

const ProductInputDialog: React.FC<ProductInputDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  title,
  submitText,
  onSubmit,
  isLoading,
  product = {
    name: '',
    caloriesCost: 100,
    category: null,
  },
}) => {
  const {
    value: productName,
    setValue: setProductName,
    clearValue: clearProductName,
    helperText: productNameHelperText,
    isInvalid: isProductNameInvalid,
    isTouched: isProductNameTouched,
  } = useValidatedState({
    initialValue: product.name,
    errorHelperText: 'Product name is invalid',
    validatorFunction: validateProductName,
  });

  const {
    value: caloriesCost,
    setValue: setCaloriesCost,
    clearValue: clearCaloriesCost,
    helperText: caloriesCostHelperText,
    isInvalid: isCaloriesCostInvalid,
    isTouched: isCaloriesCostTouched,
  } = useValidatedState({
    initialValue: product.caloriesCost,
    errorHelperText: 'Calories cost is invalid',
    validatorFunction: validateCaloriesCost,
  });

  const [category, setCategory] = useState(product.category);

  useEffect(() => {
    if (isDialogOpened) {
      clearProductName();
      clearCaloriesCost();
      setCategory(product.category);
    }
  }, [clearCaloriesCost, clearProductName, isDialogOpened, product.category]);

  function handleProductNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setProductName(event.target.value);
  }

  function handleCaloriesCostChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCaloriesCost(event.target.valueAsNumber);
  }

  function handleCategoryChange(category: CategoryAutocompleteOption | null) {
    setCategory(category);
  }

  function handleClose() {
    setIsDialogOpened(false);
  }

  function handleSubmit() {
    onSubmit({
      name: productName,
      caloriesCost,
      category,
    });
  }

  const submitValidationResults = [
    isProductNameInvalid || !isProductNameTouched,
    isCaloriesCostInvalid && isCaloriesCostTouched,
    category === null,
  ];

  const isSubmitDisabled = submitValidationResults.some(isInvalid => isInvalid);

  return (
    <Dialog open={isDialogOpened} onClose={handleClose} fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          label="Product"
          placeholder="Enter product name"
          value={productName}
          onChange={handleProductNameChange}
          helperText={productNameHelperText}
          error={isProductNameInvalid}
        />

        <TextField
          type="number"
          fullWidth
          margin="normal"
          label="Calories cost"
          placeholder="Enter calories cost"
          value={caloriesCost}
          onChange={handleCaloriesCostChange}
          helperText={caloriesCostHelperText}
          error={isCaloriesCostInvalid}
        />

        <CategorySelect
          label="Category"
          placeholder="Select a category"
          value={category}
          setValue={handleCategoryChange}
        />
      </DialogContent>

      <DialogActions>
        <AppButton disabled={isLoading} onClick={handleClose}>
          Cancel
        </AppButton>

        <AppButton
          aria-label={`${category ? 'Save' : 'Create'} ${productName} and close dialog`}
          variant="contained"
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
          isLoading={isLoading}
        >
          {submitText}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProductInputDialog;
