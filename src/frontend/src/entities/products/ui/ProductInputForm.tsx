import { TextField, type TextFieldProps } from '@mui/material';
import { useEffect, type FC, type FormEventHandler, type ReactElement } from 'react';
import { useInput, type UseInputResult } from '@/hooks';
import { type SelectOption, type SelectProps } from '@/types';
import { mapToNumericInputProps, mapToSelectProps } from '@/utils/inputMapping';
import { validateCaloriesCost, validateQuantity, validateSelectOption } from '@/utils/validation';
import { type ProductFormType } from '../model';

export interface ProductInputFormProps {
  id: string;
  product: ProductFormType;
  productNameInput: UseInputResult<string, TextFieldProps>;
  renderCategoryInput: (props: SelectProps<SelectOption>) => ReactElement;
  onSubmit: (values: ProductFormType) => void;
  onSubmitDisabledChange: (disabled: boolean) => void;
}

export const ProductInputForm: FC<ProductInputFormProps> = ({
  id,
  product,
  productNameInput,
  renderCategoryInput,
  onSubmit,
  onSubmitDisabledChange,
}) => {
  const caloriesCostInput = useInput({
    initialValue: product?.caloriesCost ?? 100,
    errorHelperText: 'Calories cost is invalid',
    validate: validateCaloriesCost,
    mapToInputProps: mapToNumericInputProps,
  });

  const defaultQuantityInput = useInput({
    initialValue: product?.defaultQuantity ?? 100,
    errorHelperText: 'Default quantity is invalid',
    validate: validateQuantity,
    mapToInputProps: mapToNumericInputProps,
  });

  const categoryInput = useInput({
    initialValue: product?.category ?? null,
    errorHelperText: 'Category is required',
    validate: validateSelectOption,
    mapToInputProps: mapToSelectProps,
  });

  const anyValueInvalid =
    productNameInput.isInvalid ||
    caloriesCostInput.isInvalid ||
    defaultQuantityInput.isInvalid ||
    categoryInput.isInvalid ||
    categoryInput.value === null;

  const anyValueChanged =
    productNameInput.isTouched ||
    caloriesCostInput.isTouched ||
    defaultQuantityInput.isTouched ||
    categoryInput.isTouched;

  useEffect(() => {
    onSubmitDisabledChange(anyValueInvalid || !anyValueChanged);
  }, [anyValueChanged, anyValueInvalid, onSubmitDisabledChange]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    onSubmit({
      name: productNameInput.value,
      caloriesCost: caloriesCostInput.value,
      defaultQuantity: defaultQuantityInput.value,
      category: categoryInput.value,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <TextField
        {...productNameInput.inputProps}
        label="Name"
        placeholder="Product name"
        fullWidth
        autoFocus
      />
      <TextField
        {...caloriesCostInput.inputProps}
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
      {renderCategoryInput(categoryInput.inputProps)}
    </form>
  );
};
