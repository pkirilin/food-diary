import { TextField } from '@mui/material';
import { type FC, useEffect, type FormEventHandler, type ReactElement } from 'react';
import { productsModel } from '@/entities/products';
import { Button, Dialog } from '@/shared/ui';
import { useInput } from 'src/hooks';
import { mapToNumericInputProps } from 'src/utils/inputMapping';
import { validateQuantity } from 'src/utils/validation';
import { getMealName, type MealType, type NoteCreateEdit } from '../../models';

interface Props {
  title: string;
  submitText: string;
  isOpened: boolean;
  mealType: MealType;
  pageId: number;
  product: productsModel.AutocompleteOptionType | null;
  quantity: number;
  displayOrder: number;
  submitInProgress: boolean;
  renderProductAutocomplete: (props: productsModel.AutocompleteInputProps) => ReactElement;
  onClose: () => void;
  onSubmit: (note: NoteCreateEdit) => Promise<void>;
}

export const NoteInputDialog: FC<Props> = ({
  title,
  submitText,
  isOpened,
  mealType,
  pageId,
  product,
  quantity,
  displayOrder,
  submitInProgress,
  renderProductAutocomplete,
  onClose,
  onSubmit,
}) => {
  const { clearValue: clearProduct, ...productInput } = useInput({
    initialValue: product,
    errorHelperText: 'Product is required',
    validate: productsModel.validateAutocompleteInput,
    mapToInputProps: productsModel.mapToAutocompleteProps,
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

  const handleSubmit: FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();

    if (productInput.value) {
      await onSubmit({
        mealType,
        productQuantity: quantityInput.value,
        displayOrder,
        product: productInput.value,
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
          {renderProductAutocomplete({
            ...productInput.inputProps,
            autoFocus: true,
          })}
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
