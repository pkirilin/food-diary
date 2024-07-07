import { TextField } from '@mui/material';
import { useEffect, type FC, type FormEventHandler, type ReactElement } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { type productLib } from '@/entities/product';
import { useInput } from '@/shared/hooks';
import { mapToNumericInputProps, validateQuantity } from '@/shared/lib';
import { type Note } from '../model';

interface Props {
  id: string;
  values: noteModel.FormValues;
  productAutocompleteInput: productLib.AutocompleteInput;
  renderProductAutocomplete: (props: productLib.AutocompleteInputProps) => ReactElement;
  onSubmit: (note: Note) => Promise<void>;
  onSubmitDisabledChange: (disabled: boolean) => void;
}

export const NoteInputForm: FC<Props> = ({
  id,
  values,
  productAutocompleteInput,
  renderProductAutocomplete,
  onSubmit,
  onSubmitDisabledChange,
}) => {
  const {
    setValue: setQuantity,
    clearValue: clearQuantity,
    ...quantityInput
  } = useInput({
    initialValue: values.quantity,
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
      pageId: values.pageId,
      mealType: values.mealType,
      displayOrder: values.displayOrder,
      productQuantity: quantityInput.value,
      product: productAutocompleteInput.value,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <TextField
        label="Meal"
        value={noteLib.getMealName(values.mealType)}
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
