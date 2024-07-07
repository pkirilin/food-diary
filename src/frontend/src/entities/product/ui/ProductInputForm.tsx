import { TextField } from '@mui/material';
import { useEffect, type FC, type FormEventHandler, type ReactElement } from 'react';
import { useInput } from '@/shared/hooks';
import {
  mapToNumericInputProps,
  mapToSelectProps,
  mapToTextInputProps,
  validateSelectOption,
} from '@/shared/lib';
import { type SelectOption, type SelectProps } from '@/shared/types';
import {
  validateProductName,
  type FormValues,
  validateCaloriesCost,
  validateDefaultQuantity,
} from '../model';

interface Props {
  id: string;
  values: FormValues;
  touched?: boolean;
  renderCategoryInput: (props: SelectProps<SelectOption>) => ReactElement;
  onSubmit: (values: FormValues) => void;
  onSubmitDisabledChange: (disabled: boolean) => void;
}

export const ProductInputForm: FC<Props> = ({
  id,
  values,
  touched = false,
  renderCategoryInput,
  onSubmit,
  onSubmitDisabledChange,
}) => {
  const productNameInput = useInput({
    initialValue: values.name,
    errorHelperText: 'Product name is invalid',
    validate: validateProductName,
    mapToInputProps: mapToTextInputProps,
    touched,
  });

  const caloriesCostInput = useInput({
    initialValue: values.caloriesCost,
    errorHelperText: 'Calories cost is invalid',
    validate: validateCaloriesCost,
    mapToInputProps: mapToNumericInputProps,
  });

  const defaultQuantityInput = useInput({
    initialValue: values.defaultQuantity,
    errorHelperText: 'Default quantity is invalid',
    validate: validateDefaultQuantity,
    mapToInputProps: mapToNumericInputProps,
  });

  const categoryInput = useInput({
    initialValue: values.category,
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
        margin="normal"
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
