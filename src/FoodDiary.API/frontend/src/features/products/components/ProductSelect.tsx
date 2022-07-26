import React, { useEffect, useState } from 'react';
import { useLazyGetProductsAutocompleteQuery } from 'src/api';
import { CustomAutocomplete } from 'src/features/__shared__/components';
import { SelectProps } from 'src/features/__shared__/types';
import { ProductAutocompleteOption } from 'src/features/products/models';

type ProductSelectProps = SelectProps<ProductAutocompleteOption>;

const ProductSelect: React.FC<ProductSelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
}) => {
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
      isOptionEqualToValue={(option, value) => option.name === value.name}
      getOptionLabel={option => option.name}
      onChange={(event, value) => setValue(value)}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    />
  );
};

export default ProductSelect;
