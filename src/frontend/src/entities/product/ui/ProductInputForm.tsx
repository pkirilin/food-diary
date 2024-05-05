import { TextField, type TextFieldProps } from '@mui/material';
import { useEffect, type FC, type FormEventHandler, type ReactElement } from 'react';
import { useInput, type UseInputResult } from '@/hooks';
import { type SelectOption, type SelectProps } from '@/types';
import { mapToNumericInputProps, mapToSelectProps } from '@/utils/inputMapping';
import { validateCaloriesCost, validateQuantity, validateSelectOption } from '@/utils/validation';
import { EMPTY_FORM_VALUES, type FormValues } from '../model';

export interface ProductInputFormProps {
  id: string;
  values: FormValues;
  productNameInput: UseInputResult<string, TextFieldProps>;
  renderCategoryInput: (props: SelectProps<SelectOption>) => ReactElement;
  onSubmit: (values: FormValues) => void;
  onSubmitDisabledChange: (disabled: boolean) => void;
}

export const ProductInputForm: FC<ProductInputFormProps> = ({
  id,
  values,
  productNameInput,
  renderCategoryInput,
  onSubmit,
  onSubmitDisabledChange,
}) => {
  const caloriesCostInput = useInput({
    initialValue: values?.caloriesCost ?? EMPTY_FORM_VALUES.caloriesCost,
    errorHelperText: 'Calories cost is invalid',
    validate: validateCaloriesCost,
    mapToInputProps: mapToNumericInputProps,
  });

  const defaultQuantityInput = useInput({
    initialValue: values?.defaultQuantity ?? EMPTY_FORM_VALUES.defaultQuantity,
    errorHelperText: 'Default quantity is invalid',
    validate: validateQuantity,
    mapToInputProps: mapToNumericInputProps,
  });

  const categoryInput = useInput({
    initialValue: values?.category ?? EMPTY_FORM_VALUES.category,
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
