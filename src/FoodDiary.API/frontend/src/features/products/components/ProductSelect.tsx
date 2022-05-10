import { useEffect, useState } from 'react';

import { useLazyGetProductsAutocompleteQuery } from 'src/api';
import { CustomAutocomplete } from 'src/features/__shared__/components';
import { SelectProps } from 'src/features/__shared__/types';
import { ProductAutocompleteOption } from 'src/features/products/models';

export type ProductSelectProps = SelectProps<ProductAutocompleteOption>;

export default function ProductSelect({
  label,
  placeholder,
  value = null,
  setValue,
}: ProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [getProductsAutocomplete, autocomplete] = useLazyGetProductsAutocompleteQuery();

  useEffect(() => {
    getProductsAutocomplete(isOpen);
  }, [getProductsAutocomplete, isOpen]);

  return (
    <CustomAutocomplete
      label={label}
      placeholder={placeholder}
      options={autocomplete.data ?? []}
      loading={autocomplete.isLoading}
      open={isOpen}
      value={value}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={option => option.name}
      onChange={(event, value) => setValue(value)}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    ></CustomAutocomplete>
  );
}
