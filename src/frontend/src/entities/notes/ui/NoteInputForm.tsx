import { useEffect, type FC, type FormEventHandler } from 'react';
import { ProductAutocompleteWithoutDialog, productsModel } from '@/entities/products';
import { type MealType, type NoteCreateEdit } from '@/features/notes';
import { useInput } from '@/hooks';

export interface NoteInputFormProps {
  id: string;
  pageId: number;
  mealType: MealType;
  displayOrder: number;
  product: productsModel.AutocompleteOptionType | null;
  productAutocomplete: productsModel.UseAutocompleteResult;
  dialogValue: productsModel.ProductFormType;
  shouldClearValues: boolean;
  onProductChange: (value: productsModel.AutocompleteOptionType | null) => void;
  onSubmit: (values: NoteCreateEdit) => Promise<void>;
  onSubmitDisabledChange: (disabled: boolean) => void;
}

export const NoteInputForm: FC<NoteInputFormProps> = ({
  id,
  pageId,
  mealType,
  displayOrder,
  product,
  productAutocomplete,
  dialogValue,
  shouldClearValues,
  onProductChange,
  onSubmit,
  onSubmitDisabledChange,
}) => {
  const { clearValue: clearProductAutocomplete, ...productInput } = useInput({
    initialValue: product,
    errorHelperText: 'Product is required',
    validate: productsModel.validateAutocompleteInput,
    mapToInputProps: productsModel.mapToAutocompleteProps,
  });

  const anyValueInvalid = productInput.isInvalid;
  const anyValueChanged = productInput.isTouched;

  useEffect(() => {
    onSubmitDisabledChange(anyValueInvalid || !anyValueChanged);
  }, [anyValueChanged, anyValueInvalid, onSubmitDisabledChange]);

  useEffect(() => {
    if (shouldClearValues) {
      clearProductAutocomplete();
    }
  }, [clearProductAutocomplete, shouldClearValues]);

  const handleProductChange = (value: productsModel.AutocompleteOptionType | null): void => {
    productInput.inputProps.onChange(value);
    onProductChange(value);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (!productInput.value) {
      return;
    }

    onSubmit({
      pageId,
      mealType,
      displayOrder,
      productQuantity: 100,
      product: productInput.value,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <ProductAutocompleteWithoutDialog
        {...productInput.inputProps}
        autoFocus
        dialogValue={dialogValue}
        options={productAutocomplete.options}
        loading={productAutocomplete.isLoading}
        onChange={handleProductChange}
      />
    </form>
  );
};
