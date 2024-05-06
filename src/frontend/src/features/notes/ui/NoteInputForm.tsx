import { TextField } from '@mui/material';
import { useEffect, type FC, type FormEventHandler, type ReactElement } from 'react';
import { type productModel } from '@/entities/product';
import { getMealName, type MealType, type NoteCreateEdit } from '@/features/notes';
import { useInput, type UseInputResult } from '@/hooks';
import { mapToNumericInputProps } from '@/utils/inputMapping';
import { validateQuantity } from '@/utils/validation';

export interface NoteInputFormProps {
  id: string;
  pageId: number;
  mealType: MealType;
  displayOrder: number;
  productAutocompleteInput: UseInputResult<
    productModel.AutocompleteOptionType | null,
    productModel.AutocompleteInputProps
  >;
  quantity: number;
  renderProductAutocomplete: (props: productModel.AutocompleteInputProps) => ReactElement;
  onSubmit: (values: NoteCreateEdit) => Promise<void>;
  onSubmitDisabledChange: (disabled: boolean) => void;
}

export const NoteInputForm: FC<NoteInputFormProps> = ({
  id,
  pageId,
  mealType,
  displayOrder,
  productAutocompleteInput,
  quantity,
  renderProductAutocomplete,
  onSubmit,
  onSubmitDisabledChange,
}) => {
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

  const anyValueInvalid = productAutocompleteInput.isInvalid || quantityInput.isInvalid;
  const anyValueChanged = productAutocompleteInput.isTouched || quantityInput.isTouched;

  useEffect(() => {
    onSubmitDisabledChange(anyValueInvalid || !anyValueChanged);
  }, [anyValueChanged, anyValueInvalid, onSubmitDisabledChange]);

  useEffect(() => {
    if (productAutocompleteInput.value && productAutocompleteInput.isTouched) {
      setQuantity(productAutocompleteInput.value.defaultQuantity);
    } else {
      clearQuantity();
    }
  }, [
    clearQuantity,
    productAutocompleteInput.isTouched,
    productAutocompleteInput.value,
    setQuantity,
  ]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (!productAutocompleteInput.value) {
      return;
    }

    onSubmit({
      pageId,
      mealType,
      displayOrder,
      productQuantity: quantityInput.value,
      product: productAutocompleteInput.value,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <TextField
        label="Meal"
        value={getMealName(mealType)}
        margin="normal"
        fullWidth
        inputProps={{ readOnly: true }}
        helperText=" "
      />
      {renderProductAutocomplete(productAutocompleteInput.inputProps)}
      <TextField
        {...quantityInput.inputProps}
        type="number"
        label="Quantity"
        placeholder="Product quantity, g"
        margin="normal"
        fullWidth
      />
    </form>
  );
};
