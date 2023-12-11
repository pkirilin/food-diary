import { TextField } from '@mui/material';
import {
  useEffect,
  type FC,
  type Dispatch,
  type SetStateAction,
  type FormEventHandler,
} from 'react';
import { AppButton, AppDialog } from 'src/components';
import { CategorySelect } from 'src/features/categories';
import { useInput } from 'src/hooks';
import {
  mapToNumericInputProps,
  mapToSelectProps,
  mapToTextInputProps,
} from 'src/utils/inputMapping';
import {
  validateCaloriesCost,
  validateProductName,
  validateSelectOption,
} from 'src/utils/validation';
import { type ProductFormData } from '../types';

interface ProductInputDialogProps {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  title: string;
  submitText: string;
  onSubmit: (product: ProductFormData) => void;
  isLoading: boolean;
  product?: ProductFormData;
}

const ProductInputDialog: FC<ProductInputDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  title,
  submitText,
  onSubmit,
  isLoading,
  product,
}) => {
  const {
    inputProps: productNameInputProps,
    value: productName,
    clearValue: clearProductName,
    isInvalid: isProductNameInvalid,
    isTouched: isProductNameTouched,
  } = useInput({
    initialValue: product?.name ?? '',
    errorHelperText: 'Product name is invalid',
    validate: validateProductName,
    mapToInputProps: mapToTextInputProps,
  });

  const {
    inputProps: caloriesCostInputProps,
    value: caloriesCost,
    clearValue: clearCaloriesCost,
    isInvalid: isCaloriesCostInvalid,
    isTouched: isCaloriesCostTouched,
  } = useInput({
    initialValue: product?.caloriesCost ?? 100,
    errorHelperText: 'Calories cost is invalid',
    validate: validateCaloriesCost,
    mapToInputProps: mapToNumericInputProps,
  });

  const {
    inputProps: categorySelectProps,
    value: category,
    clearValue: clearCategory,
    isInvalid: isCategoryInvalid,
    isTouched: isCategoryTouched,
  } = useInput({
    initialValue: product?.category ?? null,
    errorHelperText: 'Category is required',
    validate: validateSelectOption,
    mapToInputProps: mapToSelectProps,
  });

  useEffect(() => {
    if (isDialogOpened) {
      clearProductName();
      clearCaloriesCost();
      clearCategory();
    }
  }, [clearCaloriesCost, clearCategory, clearProductName, isDialogOpened]);

  const handleClose = (): void => {
    setIsDialogOpened(false);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (category) {
      onSubmit({
        name: productName,
        caloriesCost,
        category,
      });
    }
  };

  const isAnyValueInvalid = isProductNameInvalid || isCaloriesCostInvalid || isCategoryInvalid;
  const isAnyValueChanged = isProductNameTouched || isCaloriesCostTouched || isCategoryTouched;

  return (
    <AppDialog
      title={title}
      isOpened={isDialogOpened}
      onClose={handleClose}
      content={
        <form id="product-input-form" onSubmit={handleSubmit}>
          <TextField
            {...productNameInputProps}
            autoFocus
            fullWidth
            margin="normal"
            label="Product"
            placeholder="Enter product name"
          />
          <TextField
            {...caloriesCostInputProps}
            type="number"
            fullWidth
            margin="normal"
            label="Calories cost"
            placeholder="Enter calories cost"
          />
          <CategorySelect
            {...categorySelectProps}
            label="Category"
            placeholder="Select a category"
          />
        </form>
      }
      actionSubmit={
        <AppButton
          type="submit"
          form="product-input-form"
          aria-label={`${product ? 'Save' : 'Create'} ${productName} and close dialog`}
          variant="contained"
          disabled={isAnyValueInvalid || !isAnyValueChanged}
          isLoading={isLoading}
        >
          {submitText}
        </AppButton>
      }
      actionCancel={
        <AppButton type="button" disabled={isLoading} onClick={handleClose}>
          Cancel
        </AppButton>
      }
    />
  );
};

export default ProductInputDialog;
