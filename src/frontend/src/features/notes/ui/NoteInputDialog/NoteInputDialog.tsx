import { TextField } from '@mui/material';
import { type FC, useEffect, type FormEventHandler } from 'react';
import { Button, Dialog } from '@/shared/ui';
import { ProductSelect, type ProductSelectOption } from 'src/features/products';
import { useInput } from 'src/hooks';
import { mapToNumericInputProps, mapToSelectProps } from 'src/utils/inputMapping';
import { validateQuantity, validateSelectOption } from 'src/utils/validation';
import { getMealName, type MealType, type NoteCreateEdit } from '../../models';

interface Props {
  title: string;
  submitText: string;
  isOpened: boolean;
  mealType: MealType;
  pageId: number;
  product: ProductSelectOption | null;
  products: ProductSelectOption[];
  productsLoading: boolean;
  quantity: number;
  displayOrder: number;
  submitInProgress: boolean;
  onClose: () => void;
  onSubmit: (note: NoteCreateEdit) => void;
}

export const NoteInputDialog: FC<Props> = ({
  title,
  submitText,
  isOpened,
  mealType,
  pageId,
  product,
  products,
  productsLoading,
  quantity,
  displayOrder,
  submitInProgress,
  onClose,
  onSubmit,
}) => {
  const { clearValue: clearProduct, ...productInput } = useInput({
    initialValue: product,
    errorHelperText: 'Product is required',
    validate: validateSelectOption,
    mapToInputProps: mapToSelectProps,
  });

  const {
    setValue: setQuantity,
    clearValue: clearQuantity,
    ...quantityInput
  } = useInput({
    initialValue: quantity,
    errorHelperText: 'Quantity is invalid',
    validate: validateQuantity,
    mapToInputProps: mapToNumericInputProps,
  });

  useEffect(() => {
    if (isOpened) {
      clearProduct();
      clearQuantity();
    }
  }, [clearProduct, clearQuantity, isOpened]);

  useEffect(() => {
    if (isOpened && productInput.value && productInput.isTouched) {
      setQuantity(productInput.value.defaultQuantity);
    } else {
      clearQuantity();
    }
  }, [isOpened, productInput.value, productInput.isTouched, setQuantity, clearQuantity]);

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

  const anyValueInvalid = productInput.isInvalid || quantityInput.isInvalid;
  const anyValueChanged = productInput.isTouched || quantityInput.isTouched;
  const submitDisabled = anyValueInvalid || !anyValueChanged;

  return (
    <Dialog
      title={title}
      opened={isOpened}
      onClose={onClose}
      renderMode="fullScreenOnMobile"
      content={
        <form id="note-input-form" onSubmit={handleSubmit}>
          <TextField
            label="Meal"
            value={getMealName(mealType)}
            margin="normal"
            fullWidth
            inputProps={{ readOnly: true }}
            helperText=" "
          />
          <ProductSelect
            {...productInput.inputProps}
            label="Product"
            placeholder="Select a product"
            autoFocus
            options={products}
            optionsLoading={productsLoading}
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
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form="note-input-form"
          disabled={submitDisabled}
          loading={submitInProgress}
        >
          {submitText}
        </Button>
      )}
      renderCancel={cancelProps => (
        <Button {...cancelProps} type="button" onClick={onClose} disabled={submitInProgress}>
          Cancel
        </Button>
      )}
    />
  );
};
