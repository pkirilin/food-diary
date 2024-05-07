import { TextField } from '@mui/material';
import { useEffect, type FC, type FormEventHandler, type ReactElement } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { type productLib, type productModel } from '@/entities/product';
import { useInput, type UseInputResult } from '@/shared/hooks';
import { mapToNumericInputProps, validateQuantity } from '@/shared/lib';
import { type Note } from '../model';

export interface NoteInputFormProps {
  id: string;
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
  productAutocompleteInput: UseInputResult<
    productModel.AutocompleteOption | null,
    productLib.AutocompleteInputProps
  >;
  quantity: number;
  renderProductAutocomplete: (props: productLib.AutocompleteInputProps) => ReactElement;
  onSubmit: (note: Note) => Promise<void>;
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
        value={noteLib.getMealName(mealType)}
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
