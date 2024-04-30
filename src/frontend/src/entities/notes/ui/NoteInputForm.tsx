import { useEffect, type FC, type FormEventHandler, type ReactElement } from 'react';
import { type productsModel } from '@/entities/products';
import { type MealType, type NoteCreateEdit } from '@/features/notes';
import { type UseInputResult } from '@/hooks';

export interface NoteInputFormProps {
  id: string;
  pageId: number;
  mealType: MealType;
  displayOrder: number;
  productAutocompleteInput: UseInputResult<
    productsModel.AutocompleteOptionType | null,
    productsModel.AutocompleteInputProps
  >;
  renderProductAutocomplete: (props: productsModel.AutocompleteInputProps) => ReactElement;
  onSubmit: (values: NoteCreateEdit) => Promise<void>;
  onSubmitDisabledChange: (disabled: boolean) => void;
}

export const NoteInputForm: FC<NoteInputFormProps> = ({
  id,
  pageId,
  mealType,
  displayOrder,
  productAutocompleteInput,
  renderProductAutocomplete,
  onSubmit,
  onSubmitDisabledChange,
}) => {
  const anyValueInvalid = productAutocompleteInput.isInvalid;
  const anyValueChanged = productAutocompleteInput.isTouched;

  useEffect(() => {
    onSubmitDisabledChange(anyValueInvalid || !anyValueChanged);
  }, [anyValueChanged, anyValueInvalid, onSubmitDisabledChange]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (!productAutocompleteInput.value) {
      return;
    }

    onSubmit({
      pageId,
      mealType,
      displayOrder,
      productQuantity: 100,
      product: productAutocompleteInput.value,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      {renderProductAutocomplete(productAutocompleteInput.inputProps)}
    </form>
  );
};
