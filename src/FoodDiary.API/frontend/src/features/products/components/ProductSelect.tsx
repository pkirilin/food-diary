import React from 'react';
import { AppSelect } from 'src/components';
import { ProductAutocompleteOption } from 'src/features/products';
import { AutocompleteOption, SelectProps } from 'src/types';
import { useLazyProductSelectOptionsQuery } from '../api';

export type ProductSelectProps = SelectProps<ProductAutocompleteOption>;

const ProductSelect: React.FC<ProductSelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
}) => {
  const [fetchOptions, { data: options, isLoading, isUninitialized }] =
    useLazyProductSelectOptionsQuery();

  function getDisplayName(option: AutocompleteOption) {
    return option.name;
  }

  function areOptionsEqual(first: AutocompleteOption, second: AutocompleteOption) {
    return first.name === second.name;
  }

  function handleChange(value: AutocompleteOption | null) {
    setValue(value);
  }

  function handleOpen() {
    if (isUninitialized) {
      fetchOptions();
    }
  }

  return (
    <AppSelect
      availableOptions={options || []}
      value={value}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
      onChange={handleChange}
      onOpen={handleOpen}
      isLoading={isLoading}
      label={label}
      placeholder={placeholder}
    />
  );
};

export default ProductSelect;
