import { type FC } from 'react';
import { ProductAutocompleteWithoutDialog, productsModel } from '@/entities/products';
import { useInput } from '@/hooks';

export interface NoteInputFormProps {
  product: productsModel.AutocompleteOptionType | null;
  productAutocomplete: productsModel.UseAutocompleteResult;
  dialogValue: productsModel.ProductFormType;
  onProductChange: (product: productsModel.AutocompleteOptionType | null) => void;
}

export const NoteInputForm: FC<NoteInputFormProps> = ({
  product,
  productAutocomplete,
  dialogValue,
  onProductChange,
}) => {
  const { inputProps: productAutocompleteProps } = useInput({
    initialValue: product,
    errorHelperText: 'Product is required',
    validate: productsModel.validateAutocompleteInput,
    mapToInputProps: productsModel.mapToAutocompleteProps,
  });

  return (
    <ProductAutocompleteWithoutDialog
      {...productAutocompleteProps}
      autoFocus
      dialogValue={dialogValue}
      options={productAutocomplete.options}
      loading={productAutocomplete.isLoading}
      onChange={value => {
        productAutocompleteProps.onChange(value);
        onProductChange(value);
      }}
    />
  );
};
