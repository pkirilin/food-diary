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
import { type SelectOption } from 'src/types';
import {
  mapToNumericInputProps,
  mapToSelectProps,
  mapToTextInputProps,
} from 'src/utils/inputMapping';
import {
  validateCaloriesCost,
  validateProductName,
  validateQuantity,
  validateSelectOption,
} from 'src/utils/validation';
import { type ProductFormData } from '../../types';

interface ProductInputDialogProps {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  title: string;
  submitText: string;
  onSubmit: (product: ProductFormData) => void;
  isLoading: boolean;
  categories: SelectOption[];
  categoriesLoaded: boolean;
  categoriesLoading: boolean;
  onLoadCategories: () => Promise<void>;
  product?: ProductFormData;
}

const ProductInputDialog: FC<ProductInputDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  title,
  submitText,
  onSubmit,
  isLoading,
  categories,
  categoriesLoaded,
  categoriesLoading,
  onLoadCategories,
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

  const { clearValue: clearDefaultQuantity, ...defaultQuantityInput } = useInput({
    initialValue: product?.defaultQuantity ?? 100,
    errorHelperText: 'Default quantity is invalid',
    validate: validateQuantity,
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
      clearDefaultQuantity();
      clearCategory();
    }
  }, [clearCaloriesCost, clearDefaultQuantity, clearCategory, clearProductName, isDialogOpened]);

  const handleClose = (): void => {
    setIsDialogOpened(false);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (category) {
      onSubmit({
        name: productName,
        caloriesCost,
        defaultQuantity: defaultQuantityInput.value,
        category,
      });
    }
  };

  const isAnyValueInvalid =
    isProductNameInvalid ||
    isCaloriesCostInvalid ||
    isCategoryInvalid ||
    defaultQuantityInput.isInvalid;

  const isAnyValueChanged =
    isProductNameTouched ||
    isCaloriesCostTouched ||
    isCategoryTouched ||
    defaultQuantityInput.isTouched;

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
          <TextField
            {...defaultQuantityInput.inputProps}
            type="number"
            fullWidth
            margin="normal"
            label="Default quantity"
            placeholder="Enter default quantity"
          />
          <CategorySelect
            {...categorySelectProps}
            label="Category"
            placeholder="Select a category"
            options={categories}
            optionsLoaded={categoriesLoaded}
            optionsLoading={categoriesLoading}
            onLoadOptions={onLoadCategories}
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
