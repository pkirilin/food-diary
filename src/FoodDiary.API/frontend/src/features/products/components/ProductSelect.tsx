import React, { useEffect, useState } from 'react';
import { useLazyGetProductsAutocompleteQuery } from 'src/api';
import { CustomAutocomplete } from 'src/components';
import { ProductAutocompleteOption } from 'src/features/products';
import { AutocompleteOption, SelectProps } from 'src/types';

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

  function isOptionEqualToValue(option: AutocompleteOption, value: AutocompleteOption) {
    return option.name === value.name;
  }

  function getOptionLabel(option: AutocompleteOption) {
    return option.name;
  }

  function handleChange(event: React.SyntheticEvent, value: AutocompleteOption | null) {
    setValue(value);
  }

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <CustomAutocomplete
      label={label}
      placeholder={placeholder}
      options={autocomplete.data ?? []}
      loading={autocomplete.isLoading}
      open={isOpen}
      value={value}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionLabel={getOptionLabel}
      onChange={handleChange}
      onOpen={handleOpen}
      onClose={handleClose}
    />
  );
};

export default ProductSelect;
