import { Button, TextField } from '@mui/material';
import { type FC, useEffect, type FormEventHandler } from 'react';
import { AppDialog } from 'src/components';
import { ProductSelect, type ProductSelectOption } from 'src/features/products';
import { useInput } from 'src/hooks';
import { mapToNumericInputProps, mapToSelectProps } from 'src/utils/inputMapping';
import { validateQuantity, validateSelectOption } from 'src/utils/validation';
import { type MealType, type NoteCreateEdit } from '../models';

interface NoteInputDialogProps {
  title: string;
  submitText: string;
  isOpened: boolean;
  mealType: MealType;
  pageId: number;
  product: ProductSelectOption | null;
  products: ProductSelectOption[];
  productsLoaded: boolean;
  productsLoading: boolean;
  onLoadProducts: () => Promise<void>;
  quantity: number;
  displayOrder: number;
  onClose: () => void;
  onSubmit: (note: NoteCreateEdit) => void;
}

const NoteInputDialog: FC<NoteInputDialogProps> = ({
  title,
  submitText,
  isOpened,
  mealType,
  pageId,
  product,
  products,
  productsLoaded,
  productsLoading,
  onLoadProducts,
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

  const { setValue: setQuantity, ...quantityInput } = useInput({
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

  useEffect(() => {
    if (productInput.value) {
      setQuantity(productInput.value.defaultQuantity);
    }
  }, [productInput.value, setQuantity]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

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
        <form id="note-input-form" onSubmit={handleSubmit}>
          <ProductSelect
            {...productInput.inputProps}
            label="Product"
            placeholder="Select a product"
            autoFocus
            options={products}
            optionsLoaded={productsLoaded}
            optionsLoading={productsLoading}
            onLoadOptions={onLoadProducts}
          />
          <TextField
            {...quantityInput.inputProps}
            type="number"
            label="Quantity"
            placeholder="Product quantity, g"
            margin="normal"
            fullWidth
          />
        </form>
      }
      actionSubmit={
        <Button
          type="submit"
          form="note-input-form"
          variant="contained"
          color="primary"
          disabled={isAnyValueInvalid || !isAnyValueChanged}
        >
          {submitText}
        </Button>
      }
      actionCancel={
        <Button type="button" variant="text" onClick={onClose}>
          Cancel
        </Button>
      }
      onClose={onClose}
    />
  );
};

export default NoteInputDialog;
