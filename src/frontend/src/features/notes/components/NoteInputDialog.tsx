import { Button, TextField } from '@mui/material';
import { FC, useEffect } from 'react';
import { AppDialog } from 'src/components';
import { ProductSelect } from 'src/features/products';
import { useInput } from 'src/hooks';
import { SelectOption } from 'src/types';
import { mapToNumericInputProps, mapToSelectProps } from 'src/utils/inputMapping';
import { validateQuantity, validateSelectOption } from 'src/utils/validation';
import { MealType, NoteCreateEdit } from '../models';

type NoteInputDialogProps = {
  title: string;
  submitText: string;
  isOpened: boolean;
  mealType: MealType;
  pageId: number;
  product: SelectOption | null;
  quantity: number;
  displayOrder: number;
  onClose: () => void;
  onSubmit: (note: NoteCreateEdit) => void;
};

const NoteInputDialog: FC<NoteInputDialogProps> = ({
  title,
  submitText,
  isOpened,
  mealType,
  pageId,
  product,
  quantity,
  displayOrder,

  onClose,
  onSubmit,
}) => {
  const productInput = useInput({
    initialValue: product,
    errorHelperText: 'Product is required',
    validate: validateSelectOption,
    mapToInputProps: mapToSelectProps,
  });

  const quantityInput = useInput({
    initialValue: quantity,
    errorHelperText: 'Quantity is invalid',
    validate: validateQuantity,
    mapToInputProps: mapToNumericInputProps,
  });

  const clearProductInput = productInput.clearValue;
  const clearQuantityInput = quantityInput.clearValue;

  useEffect(() => {
    if (!isOpened) {
      clearProductInput();
      clearQuantityInput();
    }
  }, [clearProductInput, clearQuantityInput, isOpened]);

  const handleSubmit = (): void => {
    if (productInput.value) {
      onSubmit({
        mealType,
        productQuantity: quantityInput.value,
        displayOrder,
        productId: productInput.value.id,
        pageId,
      });
    }
  };

  const isAnyValueInvalid = productInput.isInvalid || quantityInput.isInvalid;
  const isAnyValueChanged = productInput.isTouched || quantityInput.isTouched;

  return (
    <AppDialog
      title={title}
      isOpened={isOpened}
      content={
        <>
          <ProductSelect
            {...productInput.inputProps}
            label="Product"
            placeholder="Select a product"
          />
          <TextField
            {...quantityInput.inputProps}
            type="number"
            label="Quantity"
            placeholder="Product quantity, g"
            margin="normal"
            fullWidth
          />
        </>
      }
      actionSubmit={
        <Button
          variant="contained"
          color="primary"
          disabled={isAnyValueInvalid || !isAnyValueChanged}
          onClick={handleSubmit}
        >
          {submitText}
        </Button>
      }
      actionCancel={
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
      }
      onClose={onClose}
    />
  );
};

export default NoteInputDialog;
