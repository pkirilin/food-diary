import React from 'react';
import { useLazyGetCategoriesAutocompleteQuery } from 'src/api';
import { AppSelect } from 'src/components';
import { CategoryAutocompleteOption } from 'src/features/categories';
import { AutocompleteOption, SelectProps } from 'src/types';

export type CategorySelectProps = SelectProps<CategoryAutocompleteOption>;

const CategorySelect: React.FC<CategorySelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
}) => {
  const [fetchOptions, { data: options, isLoading, isUninitialized }] =
    useLazyGetCategoriesAutocompleteQuery();

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
      fetchOptions(false);
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

export default CategorySelect;
