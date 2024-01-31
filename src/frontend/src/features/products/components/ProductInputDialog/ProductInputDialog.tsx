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
  categoriesLoading: boolean;
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
  categoriesLoading,
  product,
}) => {
  const { clearValue: clearProductName, ...productName } = useInput({
    initialValue: product?.name ?? '',
    errorHelperText: 'Product name is invalid',
    validate: validateProductName,
    mapToInputProps: mapToTextInputProps,
  });

  const { clearValue: clearCaloriesCost, ...caloriesCost } = useInput({
    initialValue: product?.caloriesCost ?? 100,
    errorHelperText: 'Calories cost is invalid',
    validate: validateCaloriesCost,
    mapToInputProps: mapToNumericInputProps,
  });

  const { clearValue: clearDefaultQuantity, ...defaultQuantity } = useInput({
    initialValue: product?.defaultQuantity ?? 100,
    errorHelperText: 'Default quantity is invalid',
    validate: validateQuantity,
    mapToInputProps: mapToNumericInputProps,
  });

  const { clearValue: clearCategory, ...category } = useInput({
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

    if (category.value) {
      onSubmit({
        name: productName.value,
        caloriesCost: caloriesCost.value,
        defaultQuantity: defaultQuantity.value,
        category: category.value,
      });
    }
  };

  const isAnyValueInvalid =
    productName.isInvalid ||
    caloriesCost.isInvalid ||
    category.isInvalid ||
    defaultQuantity.isInvalid;

  const isAnyValueChanged =
    productName.isTouched ||
    caloriesCost.isTouched ||
    category.isTouched ||
    defaultQuantity.isTouched;

  return (
    <AppDialog
      title={title}
      isOpened={isDialogOpened}
      onClose={handleClose}
      content={
        <form id="product-input-form" onSubmit={handleSubmit}>
          <TextField
            {...productName.inputProps}
            autoFocus
            fullWidth
            margin="normal"
            label="Product"
            placeholder="Enter product name"
          />
          <TextField
            {...caloriesCost.inputProps}
            type="number"
            fullWidth
            margin="normal"
            label="Calories cost"
            placeholder="Enter calories cost"
          />
          <TextField
            {...defaultQuantity.inputProps}
            type="number"
            fullWidth
            margin="normal"
            label="Default quantity"
            placeholder="Enter default quantity"
          />
          <CategorySelect
            {...category.inputProps}
            label="Category"
            placeholder="Select a category"
            options={categories}
            optionsLoading={categoriesLoading}
          />
        </form>
      }
      actionSubmit={
        <AppButton
          type="submit"
          form="product-input-form"
          aria-label={`${product ? 'Save' : 'Create'} ${productName.value} and close dialog`}
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
