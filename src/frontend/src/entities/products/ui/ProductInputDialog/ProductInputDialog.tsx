import { TextField } from '@mui/material';
import { type FormEventHandler, type FC, useEffect, type ReactElement } from 'react';
import { useInput } from '@/hooks';
import { Button, Dialog } from '@/shared/ui';
import { type SelectOption, type SelectProps } from '@/types';
import {
  mapToNumericInputProps,
  mapToSelectProps,
  mapToTextInputProps,
} from '@/utils/inputMapping';
import {
  validateCaloriesCost,
  validateProductName,
  validateQuantity,
  validateSelectOption,
} from '@/utils/validation';
import { type ProductFormType } from '../../model';

interface Props {
  title: string;
  submitText: string;
  formId: string;
  opened: boolean;
  submitting: boolean;
  product: ProductFormType;
  renderCategoryInput: (props: SelectProps<SelectOption>) => ReactElement;
  onClose: () => void;
  onSubmit: (product: ProductFormType) => void;
}

export const ProductInputDialog: FC<Props> = ({
  title,
  submitText,
  formId,
  opened,
  submitting,
  product,
  renderCategoryInput,
  onClose,
  onSubmit,
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
    if (opened) {
      clearProductName();
      clearCaloriesCost();
      clearDefaultQuantity();
      clearCategory();
    }
  }, [clearCaloriesCost, clearCategory, clearDefaultQuantity, clearProductName, opened]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    onSubmit({
      name: productName.value,
      caloriesCost: caloriesCost.value,
      defaultQuantity: defaultQuantity.value,
      category: category.value,
    });
  };

  const anyValueInvalid =
    productName.isInvalid ||
    caloriesCost.isInvalid ||
    category.isInvalid ||
    category.value === null ||
    defaultQuantity.isInvalid;

  const anyValueTouched =
    productName.isTouched ||
    caloriesCost.isTouched ||
    category.isTouched ||
    defaultQuantity.isTouched;

  return (
    <Dialog
      title={title}
      content={
        <form id={formId} onSubmit={handleSubmit}>
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
          {renderCategoryInput(category.inputProps)}
        </form>
      }
      opened={opened}
      onClose={onClose}
      renderCancel={cancelProps => (
        <Button {...cancelProps} type="button" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
      )}
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form={formId}
          loading={submitting}
          disabled={anyValueInvalid || !anyValueTouched}
        >
          {submitText}
        </Button>
      )}
    />
  );
};
